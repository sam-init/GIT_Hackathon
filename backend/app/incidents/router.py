from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.incidents import store
from app.ai.rca import generate_rca

router = APIRouter()


@router.get("")
async def list_incidents(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
):
    return store.get_all_incidents(status=status, severity=severity)


@router.get("/{incident_id}")
async def get_incident(incident_id: str):
    inc = store.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc


@router.post("/{incident_id}/analyze")
async def analyze_incident(incident_id: str):
    inc = store.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    rca = await generate_rca(inc)
    updated = store.update_incident_rca(incident_id, rca)
    return updated


@router.post("/{incident_id}/resolve")
async def resolve_incident(incident_id: str):
    result = store.resolve_incident(incident_id)
    if not result:
        raise HTTPException(status_code=404, detail="Incident not found")
    return result


@router.post("")
async def create_incident(data: dict):
    return store.create_incident(data)
