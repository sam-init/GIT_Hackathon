import json
import uuid
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional

MOCK_DATA_PATH = Path(__file__).resolve().parent.parent.parent.parent / "mock-data"
_incidents: dict = {}
_loaded = False


def _load_mock():
    global _incidents, _loaded
    if _loaded:
        return
    try:
        data = json.loads((MOCK_DATA_PATH / "incidents.json").read_text())
        for inc in data:
            _incidents[inc["id"]] = inc
    except Exception:
        pass
    _loaded = True


def get_all_incidents(status: Optional[str] = None, severity: Optional[str] = None):
    _load_mock()
    result = list(_incidents.values())
    if status:
        result = [i for i in result if i.get("status") == status]
    if severity:
        result = [i for i in result if i.get("severity") == severity]
    result.sort(key=lambda x: x.get("started_at", ""), reverse=True)
    return result


def get_incident(incident_id: str):
    _load_mock()
    return _incidents.get(incident_id)


def create_incident(data: dict):
    _load_mock()
    incident_id = f"inc-{str(uuid.uuid4())[:8]}"
    now = datetime.now(timezone.utc).isoformat()
    incident = {
        "id": incident_id,
        "status": "active",
        "detected_at": now,
        "started_at": now,
        **data,
    }
    _incidents[incident_id] = incident
    return incident


def update_incident_rca(incident_id: str, rca: dict):
    _load_mock()
    if incident_id in _incidents:
        _incidents[incident_id]["rca"] = rca
        _incidents[incident_id]["rca_generated_at"] = datetime.now(timezone.utc).isoformat()
        return _incidents[incident_id]
    return None


def resolve_incident(incident_id: str):
    _load_mock()
    if incident_id in _incidents:
        _incidents[incident_id]["status"] = "resolved"
        _incidents[incident_id]["resolved_at"] = datetime.now(timezone.utc).isoformat()
        return _incidents[incident_id]
    return None
