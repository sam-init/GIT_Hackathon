import asyncio
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


@router.post("/analyze-active")
async def analyze_active_incidents(
    limit: int = Query(20, ge=1, le=200),
    concurrency: int = Query(4, ge=1, le=16),
):
    """Precompute RCA for active incidents in parallel to reduce dashboard/detail latency."""
    active = [inc for inc in store.get_all_incidents(status="active") if not inc.get("rca")]
    to_analyze = active[:limit]

    sem = asyncio.Semaphore(concurrency)

    async def _analyze_one(incident: dict):
        async with sem:
            rca = await generate_rca(incident)
            updated = store.update_incident_rca(incident["id"], rca)
            return updated or incident

    if not to_analyze:
        return {"status": "ok", "analyzed": 0, "remaining": 0, "incidents": []}

    analyzed = await asyncio.gather(*(_analyze_one(inc) for inc in to_analyze))
    remaining = max(len(active) - len(to_analyze), 0)
    return {
        "status": "ok",
        "analyzed": len(analyzed),
        "remaining": remaining,
        "incidents": analyzed,
    }


@router.post("/{incident_id}/resolve")
async def resolve_incident(incident_id: str):
    result = store.resolve_incident(incident_id)
    if not result:
        raise HTTPException(status_code=404, detail="Incident not found")
    return result


@router.post("")
async def create_incident(data: dict):
    return store.create_incident(data)
