import json
from pathlib import Path
from typing import Optional
import networkx as nx

MOCK_DATA_PATH = Path(__file__).resolve().parent.parent.parent.parent / "mock-data"
_graph: Optional[nx.DiGraph] = None
_raw: dict = {}


def _load_graph():
    global _graph, _raw
    if _graph is not None:
        return
    data = json.loads((MOCK_DATA_PATH / "topology.json").read_text())
    topo = data["topology"]
    _raw = topo
    G = nx.DiGraph()
    for node in topo["nodes"]:
        G.add_node(node["id"], **node)
    for edge in topo["edges"]:
        G.add_edge(edge["source"], edge["target"], **edge)
    _graph = G


def get_graph() -> nx.DiGraph:
    _load_graph()
    return _graph


def get_topology_json():
    _load_graph()
    return _raw


def update_node_status(node_id: str, status: str):
    _load_graph()
    if node_id in _graph.nodes:
        _graph.nodes[node_id]["status"] = status


def get_blast_radius(node_id: str) -> list[str]:
    """BFS downstream from failed node."""
    G = get_graph()
    if node_id not in G:
        return []
    visited = set()
    queue = list(G.successors(node_id))
    while queue:
        n = queue.pop(0)
        if n not in visited:
            visited.add(n)
            queue.extend(G.successors(n))
    return list(visited)


def get_attack_paths() -> list[dict]:
    """Find RBAC privilege escalation paths."""
    G = get_graph()
    paths = []
    risky_roles = [n for n, d in G.nodes(data=True) if d.get("type") in ("cluster-role",) and d.get("status") == "warning"]
    for role in risky_roles:
        predecessors = list(G.predecessors(role))
        for pred in predecessors:
            path_nodes = list(nx.ancestors(G, pred)) + [pred, role]
            secrets = [
                s for s in G.successors(pred)
                if G.nodes[s].get("type") == "secret"
            ]
            paths.append({
                "entry": pred,
                "role": role,
                "path": path_nodes,
                "accessible_secrets": secrets,
                "risk_score": 90,
                "type": "RBAC Privilege Escalation",
            })
    return paths


def get_failure_propagation(node_id: str) -> dict:
    """Trace failure propagation from a node."""
    G = get_graph()
    blast = get_blast_radius(node_id)
    source_data = G.nodes.get(node_id, {})
    affected = []
    for n in blast:
        affected.append({
            "id": n,
            "label": G.nodes[n].get("label", n),
            "type": G.nodes[n].get("type", "unknown"),
            "impact": "high" if G.nodes[n].get("type") in ("service", "database") else "medium",
        })
    return {
        "source": node_id,
        "source_label": source_data.get("label", node_id),
        "blast_radius_count": len(blast),
        "affected_nodes": affected,
    }


def get_topology_with_status() -> dict:
    """Return topology enriched with current node statuses."""
    G = get_graph()
    nodes = [dict(G.nodes[n]) for n in G.nodes]
    edges = [{"id": d.get("id", f"{u}-{v}"), "source": u, "target": v, **d} for u, v, d in G.edges(data=True)]
    return {"nodes": nodes, "edges": edges}
