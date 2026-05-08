from fastapi import APIRouter
from app.graph.engine import (
    get_topology_with_status,
    get_blast_radius,
    get_attack_paths,
    get_failure_propagation,
    update_node_status,
)

router = APIRouter()


@router.get("")
async def get_topology():
    return get_topology_with_status()


@router.get("/blast-radius/{node_id}")
async def blast_radius(node_id: str):
    affected = get_blast_radius(node_id)
    return {"source": node_id, "affected_nodes": affected, "count": len(affected)}


@router.get("/attack-paths")
async def attack_paths():
    return get_attack_paths()


@router.get("/propagation/{node_id}")
async def failure_propagation(node_id: str):
    return get_failure_propagation(node_id)


@router.post("/simulate/{node_id}")
async def simulate_failure(node_id: str, status: str = "critical"):
    """Simulate a node failure for demo purposes."""
    update_node_status(node_id, status)
    propagation = get_failure_propagation(node_id)
    for affected in propagation["affected_nodes"]:
        update_node_status(affected["id"], "warning")
    return {
        "simulated_node": node_id,
        "new_status": status,
        "propagation": propagation,
        "topology": get_topology_with_status(),
    }


@router.post("/reset")
async def reset_topology():
    """Reset all node statuses to healthy."""
    from app.graph.engine import get_graph
    G = get_graph()
    for node in G.nodes:
        G.nodes[node]["status"] = "healthy"
    return get_topology_with_status()
