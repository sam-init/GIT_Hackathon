import time
from app.ai.client import call_llm
from app.graph.engine import get_topology_with_status, get_attack_paths
from app.incidents.store import get_all_incidents

COPILOT_SYSTEM = """You are Cypher AI Copilot — an expert Kubernetes SRE AI assistant.
You have full awareness of the cluster topology, active incidents, RBAC relationships, and failure propagation paths.
Answer questions about infrastructure state, incident causes, attack paths, and remediation steps.
Be concise, technical, and actionable. Use bullet points for steps. Never hallucinate service names not in the context."""

_context_cache: dict = {"timestamp": 0.0, "prompt_context": "", "mock_context": {}}
_CONTEXT_TTL_SECONDS = 2.0


def _build_context() -> tuple[str, dict]:
    now = time.time()
    if now - float(_context_cache.get("timestamp", 0.0)) < _CONTEXT_TTL_SECONDS:
        return _context_cache["prompt_context"], _context_cache["mock_context"]

    topo = get_topology_with_status()
    incidents = get_all_incidents()
    attack_paths = get_attack_paths()

    node_summary = ", ".join(
        f"{n['label']} ({n['status']})" for n in topo["nodes"][:10]
    )
    inc_summary = "\n".join(
        f"- [{i['severity'].upper()}] {i['title']} ({i['status']})" for i in incidents[:8]
    )
    atk_summary = "\n".join(
        f"- {a['type']}: {a['entry']} → {a['role']}" for a in attack_paths[:3]
    )

    prompt_context = f"""CLUSTER CONTEXT:
Nodes (sample): {node_summary}
Total Nodes: {len(topo['nodes'])}
Total Edges: {len(topo['edges'])}

ACTIVE INCIDENTS:
{inc_summary or 'None'}

DETECTED ATTACK PATHS:
{atk_summary or 'None'}"""

    # Structured context for smart mock routing
    mock_context = {
        "incidents": incidents,
        "nodes": topo["nodes"],
        "attack_paths": attack_paths,
    }

    _context_cache["timestamp"] = now
    _context_cache["prompt_context"] = prompt_context
    _context_cache["mock_context"] = mock_context

    return prompt_context, mock_context


async def copilot_chat(message: str, history: list[dict]) -> str:
    context_str, mock_ctx = _build_context()
    messages_str = "\n".join(
        f"{m['role'].upper()}: {m['content']}" for m in history[-6:]
    )
    prompt = f"""{context_str}

CONVERSATION HISTORY:
{messages_str}

USER QUESTION: {message}

Answer using the cluster context above. Be specific and technical."""

    return await call_llm(prompt, COPILOT_SYSTEM, max_tokens=800, context=mock_ctx)
