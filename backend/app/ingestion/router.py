from fastapi import APIRouter
from pydantic import BaseModel
from app.incidents.store import create_incident
from app.graph.engine import update_node_status, get_failure_propagation

router = APIRouter()


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
    "CrashLoopBackOff": "critical",
    "OOMKilled": "high",
    "Error": "high",
    "Pending": "medium",
    "SecurityAlert": "critical",
    "Running": "low",
}


@router.post("")
async def ingest_telemetry(payload: TelemetryPayload):
    severity = SEVERITY_MAP.get(payload.status, "medium")
    node_id = payload.node_id or payload.service.replace("-", "-")

    if severity in ("critical", "high"):
        update_node_status(node_id, "critical" if severity == "critical" else "warning")
        propagation = get_failure_propagation(node_id)
        for affected in propagation.get("affected_nodes", []):
            update_node_status(affected["id"], "warning")

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
        return {"status": "incident_created", "incident_id": incident["id"], "severity": severity}

    return {"status": "telemetry_received", "severity": severity}
