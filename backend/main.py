import os
import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.incidents.router import router as incidents_router
from app.graph.router import router as graph_router
from app.ingestion.router import router as ingestion_router
from app.copilot.router import router as copilot_router
from app.ai.router import router as ai_router

app = FastAPI(
    title="KubeGraph Sentinel API",
    description="AI-Powered Kubernetes Incident Intelligence Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
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
        "service": "KubeGraph Sentinel",
        "version": "1.0.0",
        "docs": "/docs",
    }
