from fastapi import APIRouter
from app.ai.rca import generate_rca
from app.incidents.store import get_all_incidents

router = APIRouter()


@router.post("/summarize-logs")
async def summarize_logs(data: dict):
    from app.ai.client import call_llm
    logs = data.get("logs", "")
    service = data.get("service", "unknown")
    prompt = f"Summarize these Kubernetes logs for {service} in 3 bullet points, focusing on errors:\n\n{logs[:3000]}"
    system = "You are a Kubernetes SRE log analyzer. Be concise and technical."
    result = await call_llm(prompt, system, max_tokens=400)
    return {"summary": result}


@router.get("/attack-paths/explain")
async def explain_attack_paths():
    from app.ai.client import call_llm
    from app.graph.engine import get_attack_paths
    paths = get_attack_paths()
    if not paths:
        return {"explanation": "No attack paths detected in the current cluster topology."}
    paths_str = "\n".join(
        f"- {p['type']}: {' → '.join(str(x) for x in p['path'][:4])}" for p in paths
    )
    prompt = f"""Explain these Kubernetes RBAC attack paths in plain English for a security briefing:

{paths_str}

Explain: what the risk is, how an attacker could exploit it, and what the immediate remediation steps are."""
    system = "You are a Kubernetes security expert explaining attack paths to engineering leadership."
    result = await call_llm(prompt, system, max_tokens=600)
    return {"paths": paths, "explanation": result}
