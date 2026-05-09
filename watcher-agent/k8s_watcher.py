#!/usr/bin/env python3
"""
KubeGraph Sentinel — Real Kubernetes Watcher Agent (Python)
Connects to your minikube cluster via KUBECONFIG and watches for real pod failures.
Sends structured telemetry to the backend at KUBESENTINEL_API.
"""

import os
import sys
import json
import time
import logging
import httpx
from datetime import datetime, timezone

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [watcher] %(levelname)s %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("kubesentinel-watcher")

BACKEND_URL = os.getenv("WATCHER_BACKEND_URL", "http://localhost:8000")
WATCH_NAMESPACES = os.getenv("WATCH_NAMESPACES", "kubesentinel-demo,kubesentinel-data").split(",")
WATCH_NAMESPACE_SET = {ns.strip() for ns in WATCH_NAMESPACES if ns.strip()}
POLL_INTERVAL = int(os.getenv("WATCHER_POLL_INTERVAL", "15"))
KUBECONFIG = os.getenv("KUBECONFIG", os.path.expanduser("~/.kube/config"))
WATCH_RBAC_SCOPE_TO_WATCH_NAMESPACES = os.getenv("WATCH_RBAC_SCOPE_TO_WATCH_NAMESPACES", "true").lower() == "true"
WATCH_RBAC_IGNORE_BINDINGS = {
    b.strip() for b in os.getenv("WATCH_RBAC_IGNORE_BINDINGS", "minikube-rbac").split(",") if b.strip()
}
WATCH_RBAC_IGNORE_NAMESPACES = {
    ns.strip()
    for ns in os.getenv(
        "WATCH_RBAC_IGNORE_NAMESPACES",
        "kube-system,kube-public,kube-node-lease",
    ).split(",")
    if ns.strip()
}

# Map k8s deployment names → topology graph node IDs
NODE_ID_MAP = {
    "auth-service":       "auth-svc",
    "payment-service":    "payment-svc",
    "order-service":      "order-svc",
    "notification-service": "notification-svc",
    "admin-dashboard":    "admin-svc",
    "postgresql-primary": "postgres",
    "redis-cluster":      "redis",
    "kafka-broker":       "kafka",
    "nginx-ingress":      "ingress",
}


def get_node_id(name: str, labels: dict) -> str:
    # Check label first
    if labels and "kubesentinel-node-id" in labels:
        return labels["kubesentinel-node-id"]
    # Then try name map (strip pod suffix patterns)
    for svc_name, node_id in NODE_ID_MAP.items():
        if name.startswith(svc_name):
            return node_id
    return name


def send_telemetry(payload: dict):
    try:
        r = httpx.post(f"{BACKEND_URL}/telemetry", json=payload, timeout=10)
        if r.status_code == 200:
            result = r.json()
            if result.get("status") == "incident_created":
                log.info(f"  → Incident created: {result.get('incident_id')} [{result.get('severity')}]")
        else:
            log.warning(f"  → Backend returned {r.status_code}")
    except Exception as e:
        log.warning(f"  → Failed to reach backend: {e}")


def check_pod_status(v1, namespace: str, seen_restarts: dict):
    """Poll pods and detect failures."""
    try:
        pods = v1.list_namespaced_pod(namespace=namespace, watch=False)
    except Exception as e:
        log.warning(f"Failed to list pods in {namespace}: {e}")
        return

    for pod in pods.items:
        name = pod.metadata.name
        labels = pod.metadata.labels or {}
        node_id = get_node_id(name, labels)
        # Derive service name from deployment label or name
        svc_name = labels.get("app", name.rsplit("-", 2)[0])

        status = pod.status
        phase = status.phase or "Unknown"

        # Check container statuses
        container_statuses = status.container_statuses or []
        for cs in container_statuses:
            waiting = cs.state.waiting if cs.state else None
            reason = waiting.reason if waiting else None
            restart_count = cs.restart_count or 0
            prev_restarts = seen_restarts.get(name, 0)

            # Detect CrashLoopBackOff
            if reason in ("CrashLoopBackOff", "Error", "OOMKilled", "ImagePullBackOff"):
                log.warning(f"[{namespace}] {name} → {reason} (restarts: {restart_count})")
                send_telemetry({
                    "service": svc_name,
                    "status": reason,
                    "restart_count": restart_count,
                    "recent_deployment": True,
                    "logs_summary": f"Pod {name} in {reason}. Restart count: {restart_count}.",
                    "namespace": namespace,
                    "node_id": node_id,
                })
                seen_restarts[name] = restart_count

            # Detect restart spike (>= 3 new restarts since last check)
            elif restart_count > 0 and (restart_count - prev_restarts) >= 3:
                log.warning(f"[{namespace}] {name} → Restart spike ({prev_restarts}→{restart_count})")
                send_telemetry({
                    "service": svc_name,
                    "status": "RestartSpike",
                    "restart_count": restart_count,
                    "recent_deployment": False,
                    "logs_summary": f"Restart spike detected: {restart_count} total restarts on {name}.",
                    "namespace": namespace,
                    "node_id": node_id,
                })
                seen_restarts[name] = restart_count

            # Healthy — update count silently
            else:
                seen_restarts[name] = restart_count

        # Detect OOMKilled in last state
        for cs in container_statuses:
            if cs.last_state and cs.last_state.terminated:
                terminated = cs.last_state.terminated
                if terminated.reason == "OOMKilled":
                    log.warning(f"[{namespace}] {name} → OOMKilled (previous termination)")
                    send_telemetry({
                        "service": svc_name,
                        "status": "OOMKilled",
                        "restart_count": cs.restart_count or 0,
                        "recent_deployment": False,
                        "logs_summary": f"OOMKilled detected on {name}. Container exceeded memory limits.",
                        "namespace": namespace,
                        "node_id": node_id,
                    })


def check_risky_rbac(rbac_v1):
    """Detect over-privileged ClusterRoleBindings."""
    try:
        bindings = rbac_v1.list_cluster_role_binding(watch=False)
        for binding in bindings.items:
            binding_name = (binding.metadata.name or "").strip()
            if binding_name in WATCH_RBAC_IGNORE_BINDINGS:
                continue
            if binding.role_ref.name != "cluster-admin":
                continue

            for subject in (binding.subjects or []):
                if subject.kind != "ServiceAccount":
                    continue

                subject_ns = (subject.namespace or "default").strip()
                if subject_ns in WATCH_RBAC_IGNORE_NAMESPACES:
                    continue
                if (
                    WATCH_RBAC_SCOPE_TO_WATCH_NAMESPACES
                    and WATCH_NAMESPACE_SET
                    and subject_ns not in WATCH_NAMESPACE_SET
                ):
                    continue

                log.warning(f"[RBAC] RISK: {subject.name} in {subject_ns} → cluster-admin")
                send_telemetry({
                    "service": subject.name,
                    "status": "SecurityAlert",
                    "restart_count": 0,
                    "recent_deployment": False,
                    "logs_summary": (
                        f"AUDIT: ServiceAccount {subject.name} bound to ClusterRole cluster-admin. "
                        f"Binding: {binding_name}. "
                        f"Potential privilege escalation path detected."
                    ),
                    "namespace": subject_ns,
                    "node_id": f"sa-{subject.name.replace('-sa', '')}",
                })
    except Exception as e:
        log.warning(f"RBAC check failed: {e}")


def watch_events(v1, namespace: str, seen_events: set):
    """Watch Kubernetes Events for additional failure context."""
    try:
        events = v1.list_namespaced_event(namespace=namespace, watch=False)
        for event in events.items:
            uid = event.metadata.uid
            if uid in seen_events:
                continue
            seen_events.add(uid)

            if event.type == "Warning":
                reason = event.reason or ""
                msg = event.message or ""
                involved = event.involved_object
                svc_name = involved.name.rsplit("-", 2)[0] if involved else "unknown"
                log.info(f"[{namespace}] Event Warning: {reason} on {involved.name if involved else '?'} — {msg[:80]}")

                if reason in ("BackOff", "Failed", "OOMKilling", "Evicted", "Unhealthy"):
                    send_telemetry({
                        "service": svc_name,
                        "status": reason,
                        "restart_count": 0,
                        "recent_deployment": False,
                        "logs_summary": f"K8s Event [{reason}]: {msg[:200]}",
                        "namespace": namespace,
                        "node_id": get_node_id(svc_name, {}),
                    })
    except Exception as e:
        log.warning(f"Event watch failed in {namespace}: {e}")


def main():
    try:
        from kubernetes import client, config
    except ImportError:
        log.error("kubernetes package not installed. Run: pip install kubernetes")
        sys.exit(1)

    log.info("KubeGraph Sentinel — Real Kubernetes Watcher starting")
    log.info(f"Namespaces: {WATCH_NAMESPACES}")
    log.info(f"Backend: {BACKEND_URL}")
    log.info(f"Poll interval: {POLL_INTERVAL}s")

    # Load kubeconfig (works from WSL with correct kubeconfig)
    try:
        config.load_kube_config(config_file=KUBECONFIG if os.path.exists(KUBECONFIG) else None)
        log.info(f"Loaded kubeconfig: {KUBECONFIG}")
    except Exception:
        try:
            config.load_incluster_config()
            log.info("Using in-cluster config")
        except Exception as e:
            log.error(f"Could not load Kubernetes config: {e}")
            sys.exit(1)

    v1 = client.CoreV1Api()
    rbac_v1 = client.RbacAuthorizationV1Api()

    # Verify connection
    try:
        nodes = v1.list_node(watch=False)
        node_names = [n.metadata.name for n in nodes.items]
        log.info(f"Connected to cluster. Nodes: {node_names}")
    except Exception as e:
        log.error(f"Cannot connect to cluster: {e}")
        sys.exit(1)

    seen_restarts: dict = {}
    seen_events: set = set()
    rbac_check_interval = 60
    last_rbac_check = 0

    log.info("Watching for failures... (Ctrl+C to stop)")

    while True:
        for ns in WATCH_NAMESPACES:
            check_pod_status(v1, ns.strip(), seen_restarts)
            watch_events(v1, ns.strip(), seen_events)

        # RBAC check every 60s
        now = time.time()
        if now - last_rbac_check > rbac_check_interval:
            check_risky_rbac(rbac_v1)
            last_rbac_check = now

        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
