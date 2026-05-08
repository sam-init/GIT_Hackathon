import os
import httpx
import re

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "")
NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
NVIDIA_MODEL = os.getenv("NVIDIA_MODEL", "meta/llama-3.1-70b-instruct")


async def call_llm(prompt: str, system: str, max_tokens: int = 1024, context: dict = {}) -> str:
    if not NVIDIA_API_KEY:
        return _smart_mock_response(prompt, context)

    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": NVIDIA_MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": max_tokens,
        "temperature": 0.3,
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(f"{NVIDIA_BASE_URL}/chat/completions", json=payload, headers=headers)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


def _smart_mock_response(prompt: str, context: dict = {}) -> str:
    """
    Context-aware mock response that actually reads the user's question
    and answers from the cluster context. Used when no NVIDIA_API_KEY is set.
    """
    q = prompt.lower()
    incidents = context.get("incidents", [])
    nodes = context.get("nodes", [])
    attack_paths = context.get("attack_paths", [])

    # Pick out relevant incidents
    critical = [i for i in incidents if i.get("severity") == "critical"]
    active   = [i for i in incidents if i.get("status") == "active"]

    # --- Route based on question keywords ---

    if any(w in q for w in ["crash", "crashloop", "auth"]):
        return (
            "**auth-service CrashLoopBackOff Analysis**\n\n"
            "The `auth-service` is in CrashLoopBackOff because its container is exiting immediately on start. "
            "Common causes:\n"
            "- Bad image tag (ImagePullBackOff → container never starts)\n"
            "- Missing environment variable or secret (`JWT_SECRET`, `DB_PASSWORD`)\n"
            "- Dependency on `postgres` or `redis` not yet ready\n\n"
            "**Graph analysis:** auth-service depends on `postgres` (kubesentinel-data). "
            "Blast radius includes `payment-service`, `order-service`, `frontend-svc`.\n\n"
            "**Fix:**\n"
            "```\n"
            "kubectl describe pod -l app=auth-service -n kubesentinel-demo\n"
            "kubectl logs -l app=auth-service -n kubesentinel-demo --previous\n"
            "kubectl set image deployment/auth-service auth-service=nginx:alpine -n kubesentinel-demo\n"
            "```\n\n"
            "_(Mock mode — set NVIDIA_API_KEY for live LLM analysis)_"
        )

    if any(w in q for w in ["redis", "cache", "oom", "memory"]):
        return (
            "**Redis OOMKilled Analysis**\n\n"
            "`redis-cluster` was killed by the kubelet because it exceeded its memory limit. "
            "This causes the cache layer to go offline, impacting all services that depend on it.\n\n"
            "**Affected services (blast radius):** `auth-service`, `payment-service`, `order-service`\n\n"
            "**Fix:**\n"
            "```\n"
            "# Increase memory limit\n"
            "kubectl patch deployment redis-cluster -n kubesentinel-data \\\n"
            "  --type=json -p='[{\"op\":\"replace\",\"path\":\"/spec/template/spec/containers/0/resources/limits/memory\",\"value\":\"512Mi\"}]'\n"
            "kubectl rollout restart deployment/redis-cluster -n kubesentinel-data\n"
            "```\n\n"
            "_(Mock mode — set NVIDIA_API_KEY for live LLM analysis)_"
        )

    if any(w in q for w in ["attack", "rbac", "privilege", "escalat", "security"]):
        return (
            "**RBAC Attack Path Detected**\n\n"
            "`auth-sa` (ServiceAccount in `kubesentinel-demo`) is bound to `cluster-admin` via "
            "`auth-sa-admin-binding`. This is a critical misconfiguration.\n\n"
            "**Attack chain:**\n"
            "```\n"
            "auth-sa → cluster-admin → ALL namespaces\n"
            "       → can read: postgres-credentials (kubesentinel-data)\n"
            "       → can read: api-keys-secret (kubesentinel-demo)\n"
            "```\n\n"
            "**Remediation:**\n"
            "```\n"
            "# Remove the over-privileged binding\n"
            "kubectl delete clusterrolebinding auth-sa-admin-binding\n\n"
            "# Scope auth-sa to only what it needs\n"
            "kubectl create rolebinding auth-sa-scoped \\\n"
            "  --role=auth-role --serviceaccount=kubesentinel-demo:auth-sa -n kubesentinel-data\n"
            "```\n\n"
            "_(Mock mode — set NVIDIA_API_KEY for live LLM analysis)_"
        )

    if any(w in q for w in ["blast", "impact", "affect", "downstream"]):
        return (
            "**Blast Radius Analysis**\n\n"
            "Based on the graph topology (NetworkX BFS traversal):\n\n"
            "| Failure Origin | Affected Downstream Services |\n"
            "|---|---|\n"
            "| auth-service | payment-svc, order-svc, frontend-svc, notification-svc |\n"
            "| postgres | auth-svc, payment-svc, order-svc |\n"
            "| redis | auth-svc, payment-svc, order-svc |\n"
            "| ingress | ALL services (cluster-wide) |\n\n"
            "The graph has 19 nodes and 24 edges. auth-service has the highest fan-out.\n\n"
            "_(Mock mode — set NVIDIA_API_KEY for live LLM analysis)_"
        )

    if any(w in q for w in ["payment", "latency", "slow", "p99", "timeout"]):
        return (
            "**payment-service Latency Analysis**\n\n"
            "`payment-service` P99 latency is >8s, likely caused by:\n"
            "- Upstream dependency on `postgres` connection saturation\n"
            "- Redis cache miss rate spike (if redis is degraded)\n"
            "- Stripe API external timeout\n\n"
            "**Fix:**\n"
            "```\n"
            "kubectl top pods -n kubesentinel-demo\n"
            "kubectl logs -l app=payment-service -n kubesentinel-demo | grep ERROR\n"
            "```\n\n"
            "_(Mock mode — set NVIDIA_API_KEY for live LLM analysis)_"
        )

    if any(w in q for w in ["fix", "remediat", "how", "resolve", "what should"]):
        active_titles = [i["title"] for i in active[:3]]
        return (
            f"**Recommended Remediation Steps**\n\n"
            f"Active incidents right now: {len(active)}\n\n"
            + ("\n".join(f"- {t}" for t in active_titles) if active_titles else "- No active incidents")
            + "\n\n**General runbook:**\n"
            "1. Check pod logs: `kubectl logs <pod> -n kubesentinel-demo --previous`\n"
            "2. Check events: `kubectl get events -n kubesentinel-demo --sort-by=.lastTimestamp`\n"
            "3. Restart affected deployment: `kubectl rollout restart deployment/<name> -n kubesentinel-demo`\n"
            "4. Reset demo cluster: `./scripts/simulate_k8s_failure.sh reset`\n\n"
            "_(Mock mode — set NVIDIA_API_KEY for live LLM analysis)_"
        )

    if any(w in q for w in ["healthy", "status", "overview", "summary", "what"]):
        crit_count = len(critical)
        return (
            f"**Cluster Status Summary**\n\n"
            f"- **Total incidents:** {len(incidents)} ({len(active)} active)\n"
            f"- **Critical:** {crit_count}\n"
            f"- **Nodes in graph:** {len(nodes)}\n"
            f"- **Attack paths:** {len(attack_paths)} detected\n\n"
            + (f"Most critical: **{critical[0]['title']}**\n" if critical else "")
            + "\nRun `./scripts/demo_status.sh` for full cluster view.\n\n"
            "_(Mock mode — set NVIDIA_API_KEY for live LLM analysis)_"
        )

    # Default fallback — at least acknowledge the message
    return (
        f"⚠️ **Mock mode active** — no `NVIDIA_API_KEY` configured.\n\n"
        f"Your question: *\"{prompt.split('USER QUESTION:')[-1].strip()[:120]}\"*\n\n"
        f"To get a real AI response, add your NVIDIA API key to `.env`:\n"
        f"```\nNVIDIA_API_KEY=your_key_here\n```\n"
        f"Get a free key at: https://build.nvidia.com\n\n"
        f"**Current cluster state:**\n"
        f"- {len(incidents)} total incidents, {len(active)} active\n"
        f"- {len(attack_paths)} attack path(s) detected\n"
        f"- {len(nodes)} nodes in topology graph"
    )
