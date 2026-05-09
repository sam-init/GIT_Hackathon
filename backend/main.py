import os
import json
import time
from collections import deque
from pathlib import Path
from threading import Lock
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.incidents.router import router as incidents_router
from app.graph.router import router as graph_router
from app.ingestion.router import router as ingestion_router
from app.copilot.router import router as copilot_router
from app.ai.router import router as ai_router
from app.incidents.store import create_incident, get_all_incidents

app = FastAPI(
    title="Cypher AI API",
    description="AI-Powered Kubernetes Incident Intelligence Platform",
    version="1.0.0",
)

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
origins = ["*"] if CORS_ORIGINS == "*" else CORS_ORIGINS.split(",")

DDOS_WINDOW_SEC = float(os.getenv("DDOS_WINDOW_SEC", "10"))
DDOS_THRESHOLD = int(os.getenv("DDOS_THRESHOLD", "120"))
DDOS_ALERT_COOLDOWN_SEC = float(os.getenv("DDOS_ALERT_COOLDOWN_SEC", "120"))

_request_times: deque[float] = deque()
_last_ddos_alert_at = 0.0
_ddos_lock = Lock()


def _emit_ddos_incident_if_needed(path: str):
    global _last_ddos_alert_at
    if path in ("/health", "/"):
        return

    if DDOS_WINDOW_SEC <= 0 or DDOS_THRESHOLD <= 0:
        return

    now = time.time()
    should_alert = False
    observed_count = 0

    with _ddos_lock:
        _request_times.append(now)
        while _request_times and now - _request_times[0] > DDOS_WINDOW_SEC:
            _request_times.popleft()

        observed_count = len(_request_times)
        if observed_count < DDOS_THRESHOLD:
            return

        if now - _last_ddos_alert_at < DDOS_ALERT_COOLDOWN_SEC:
            return

        _last_ddos_alert_at = now
        should_alert = True

    if not should_alert:
        return

    active_spike = any(
        inc.get("status") == "active"
        and inc.get("service") == "backend"
        and "TrafficSpike" in inc.get("title", "")
        for inc in get_all_incidents(status="active")
    )
    if active_spike:
        return

    window_sec = max(1, round(DDOS_WINDOW_SEC))
    approx_rps = round(observed_count / DDOS_WINDOW_SEC, 1)
    create_incident({
        "title": "backend TrafficSpike",
        "severity": "critical",
        "service": "backend",
        "namespace": "default",
        "affected_nodes": ["backend"],
        "blast_radius": [],
        "telemetry": {
            "service": "backend",
            "status": "TrafficSpike",
            "restart_count": 0,
            "recent_deployment": False,
            "deployment_time": None,
            "logs_summary": f"Potential request flood detected: {observed_count} requests in {window_sec}s (~{approx_rps} req/s) on API endpoints.",
            "namespace": "default",
            "node_id": "backend",
        },
        "timeline": [],
    })


@app.middleware("http")
async def request_flood_detector(request: Request, call_next):
    _emit_ddos_incident_if_needed(request.url.path)
    return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,  # must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(incidents_router, prefix="/incidents", tags=["incidents"])
app.include_router(graph_router, prefix="/graph", tags=["graph"])
app.include_router(ingestion_router, prefix="/telemetry", tags=["telemetry"])
app.include_router(copilot_router, prefix="/copilot", tags=["copilot"])
app.include_router(ai_router, prefix="/ai", tags=["ai"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "kubesentinel-backend"}


@app.get("/")
async def root():
    return {
        "service": "Cypher AI",
        "version": "1.0.0",
        "docs": "/docs",
    }
