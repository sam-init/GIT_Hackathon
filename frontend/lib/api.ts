const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface TopologyNode {
  id: string;
  type: string;
  status?: string;
  label?: string;
  service?: string;
  namespace?: string;
  [key: string]: unknown;
}

export interface TopologyEdge {
  id?: string;
  source: string;
  target: string;
  type: string;
  [key: string]: unknown;
}

export interface TopologyData {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

export interface AttackPath {
  type: string;
  risk_score: number;
  path: string[];
  accessible_secrets?: string[];
  entry: string;
}

export interface AttackPathExplanation {
  explanation?: string;
  [key: string]: unknown;
}

export interface IncidentRca {
  root_cause: string;
  evidence: string[];
  affected_services: string[];
  confidence_score: number;
  remediation: string[];
  kubectl_commands: string[];
  summary: string;
}

export interface IncidentTimelineEvent {
  timestamp?: string;
  time?: string;
  message?: string;
  event?: string;
  [key: string]: unknown;
}

export interface AttackPathDetail {
  risk_score: number;
  path: string[];
}

export interface Incident {
  id: string;
  title: string;
  severity: string;
  status: string;
  service: string;
  namespace: string;
  started_at: string;
  blast_radius?: string[];
  attack_path?: boolean;
  attack_path_detail?: AttackPathDetail;
  rca?: IncidentRca;
  telemetry?: unknown;
  timeline?: IncidentTimelineEvent[];
  [key: string]: unknown;
}

export interface CopilotHistoryMessage {
  role: string;
  content: string;
}

export interface CopilotResponse {
  response: string;
}

export async function fetchTopology(): Promise<TopologyData> {
  const res = await fetch(`${API}/graph`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error("Failed to fetch topology");
  return res.json();
}

export async function fetchIncidents(status?: string): Promise<Incident[]> {
  const url = status ? `${API}/incidents?status=${status}` : `${API}/incidents`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error("Failed to fetch incidents");
  return res.json();
}

export async function fetchIncident(id: string): Promise<Incident> {
  const res = await fetch(`${API}/incidents/${id}`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error("Failed to fetch incident");
  return res.json();
}

export async function fetchAttackPaths(): Promise<AttackPath[]> {
  const res = await fetch(`${API}/graph/attack-paths`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error("Failed to fetch attack paths");
  return res.json();
}

export async function simulateFailure(nodeId: string): Promise<{ topology: TopologyData }> {
  const res = await fetch(`${API}/graph/simulate/${nodeId}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to simulate failure");
  return res.json();
}

export async function resetTopology(): Promise<TopologyData> {
  const res = await fetch(`${API}/graph/reset`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to reset topology");
  return res.json();
}

export async function analyzeIncident(id: string) {
  const res = await fetch(`${API}/incidents/${id}/analyze`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to analyze incident");
  return res.json();
}

export async function chatWithCopilot(message: string, history: CopilotHistoryMessage[]): Promise<CopilotResponse> {
  const res = await fetch(`${API}/copilot/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) throw new Error("Failed to chat");
  return res.json();
}

export async function explainAttackPaths(): Promise<AttackPathExplanation> {
  const res = await fetch(`${API}/ai/attack-paths/explain`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error("Failed to explain attack paths");
  return res.json();
}

export { API };
