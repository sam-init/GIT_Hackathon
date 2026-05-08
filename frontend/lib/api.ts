const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchTopology() {
  const res = await fetch(`${API}/graph`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error("Failed to fetch topology");
  return res.json();
}

export async function fetchIncidents(status?: string) {
  const url = status ? `${API}/incidents?status=${status}` : `${API}/incidents`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error("Failed to fetch incidents");
  return res.json();
}

export async function fetchIncident(id: string) {
  const res = await fetch(`${API}/incidents/${id}`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error("Failed to fetch incident");
  return res.json();
}

export async function fetchAttackPaths() {
  const res = await fetch(`${API}/graph/attack-paths`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error("Failed to fetch attack paths");
  return res.json();
}

export async function simulateFailure(nodeId: string) {
  const res = await fetch(`${API}/graph/simulate/${nodeId}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to simulate failure");
  return res.json();
}

export async function resetTopology() {
  const res = await fetch(`${API}/graph/reset`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to reset topology");
  return res.json();
}

export async function analyzeIncident(id: string) {
  const res = await fetch(`${API}/incidents/${id}/analyze`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to analyze incident");
  return res.json();
}

export async function chatWithCopilot(message: string, history: { role: string; content: string }[]) {
  const res = await fetch(`${API}/copilot/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) throw new Error("Failed to chat");
  return res.json();
}

export async function explainAttackPaths() {
  const res = await fetch(`${API}/ai/attack-paths/explain`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error("Failed to explain attack paths");
  return res.json();
}

export { API };
