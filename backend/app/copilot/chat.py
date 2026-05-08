import json
from app.ai.client import call_llm
from app.graph.engine import get_topology_with_status, get_attack_paths, get_blast_radius
from app.incidents.store import get_all_incidents

COPILOT_SYSTEM = """You are KubeGraph Sentinel Copilot — an expert Kubernetes SRE AI assistant.
You have full awareness of the cluster topology, active incidents, RBAC relationships, and failure propagation paths.
Answer questions about infrastructure state, incident causes, attack paths, and remediation steps.
Be concise, technical, and actionable. Use bullet points for steps. Never hallucinate service names not in the context."""


def _build_context() -> str:
    topo = get_topology_with_status()
    incidents = get_all_incidents(status="active")
    attack_paths = get_attack_paths()
    node_summary = ", ".join(
        f"{n['label']} ({n['status']})" for n in topo["nodes"][:10]
    )
    inc_summary = "\n".join(
        f"- [{i['severity'].upper()}] {i['title']} ({i['status']})" for i in incidents[:5]
    )
    atk_summary = "\n".join(
        f"- {a['type']}: {a['entry']} → {a['role']}" for a in attack_paths[:3]
    )
    return f"""CLUSTER CONTEXT:
Nodes (sample): {node_summary}
Total Nodes: {len(topo['nodes'])}
Total Edges: {len(topo['edges'])}

ACTIVE INCIDENTS:
{inc_summary or 'None'}

DETECTED ATTACK PATHS:
{atk_summary or 'None'}"""


async def copilot_chat(message: str, history: list[dict]) -> str:
    context = _build_context()
    messages_str = "\n".join(
        f"{m['role'].upper()}: {m['content']}" for m in history[-6:]
    )
    prompt = f"""{context}

CONVERSATION HISTORY:
{messages_str}

USER QUESTION: {message}

Answer using the cluster context above. Be specific and technical."""
    return await call_llm(prompt, COPILOT_SYSTEM, max_tokens=800)
