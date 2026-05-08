from fastapi import APIRouter
from pydantic import BaseModel
from app.incidents.store import create_incident, get_all_incidents
from app.graph.engine import update_node_status, get_failure_propagation

router = APIRouter()

# Dedup cache: tracks (service, status) pairs already seen in this session
# Maps "service:status" -> incident_id to avoid flooding on repeated watcher polls
_seen_alerts: dict[str, str] = {}


class TelemetryPayload(BaseModel):
    service: str
    status: str
    restart_count: int = 0
    recent_deployment: bool = False
    deployment_time: str | None = None
    logs_summary: str = ""
    namespace: str = "default"
    node_id: str | None = None


SEVERITY_MAP = {
    "CrashLoopBackOff":  "critical",
    "ImagePullBackOff":  "high",
    "ErrImagePull":      "high",
    "OOMKilled":         "high",
    "Error":             "high",
    "RestartSpike":      "high",
    "BackOff":           "medium",
    "Evicted":           "high",
    "Unhealthy":         "medium",
    "Pending":           "medium",
    "SecurityAlert":     "critical",
    "Running":           "low",
}


@router.post("")
async def ingest_telemetry(payload: TelemetryPayload):
    severity = SEVERITY_MAP.get(payload.status, "medium")
    node_id = payload.node_id or payload.service

    if severity not in ("critical", "high", "medium"):
        return {"status": "telemetry_received", "severity": severity}

    # Dedup: skip if we've already created an incident for this service+status combo
    dedup_key = f"{payload.service}:{payload.status}"
    if dedup_key in _seen_alerts:
        existing_id = _seen_alerts[dedup_key]
        return {"status": "deduplicated", "existing_incident": existing_id, "severity": severity}

    # Update graph
    if severity in ("critical", "high"):
        update_node_status(node_id, "critical" if severity == "critical" else "warning")
        propagation = get_failure_propagation(node_id)
        for affected in propagation.get("affected_nodes", []):
            update_node_status(affected["id"], "warning")
    else:
        propagation = {"affected_nodes": []}

    incident = create_incident({
        "title": f"{payload.service} {payload.status}",
        "severity": severity,
        "service": payload.service,
        "namespace": payload.namespace,
        "affected_nodes": [node_id],
        "blast_radius": [n["id"] for n in propagation.get("affected_nodes", [])],
        "telemetry": payload.model_dump(),
        "timeline": [],
    })

    # Register in dedup cache
    _seen_alerts[dedup_key] = incident["id"]

    return {"status": "incident_created", "incident_id": incident["id"], "severity": severity}


@router.delete("/reset-dedup")
async def reset_dedup():
    """Clear the dedup cache so the watcher can create fresh incidents."""
    _seen_alerts.clear()
    return {"status": "dedup_cache_cleared"}
