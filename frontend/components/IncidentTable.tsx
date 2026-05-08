"use client";

interface Incident {
  id: string; title: string; severity: string; status: string;
  service: string; namespace: string; started_at: string;
}

const SEV_COLOR: Record<string, string> = {
  critical: "#ef4444", high: "#f59e0b", medium: "#fde68a", low: "#10b981",
};
const STATUS_COLOR: Record<string, string> = {
  active: "#ef4444", investigating: "#f59e0b", resolved: "#10b981",
};

export function IncidentTable({ incidents }: { incidents: Incident[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {incidents.map(inc => (
        <a key={inc.id} href={`/incidents/${inc.id}`} style={{ textDecoration: "none" }}>
          <div
            style={{
              padding: "16px 20px", borderRadius: 10, background: "rgba(17,24,39,0.8)",
              border: "1px solid #1e2d45", display: "flex", alignItems: "center", gap: 16,
              transition: "border-color 0.2s", cursor: "pointer",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#2d4060")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "#1e2d45")}
          >
            <span className={`badge badge-${inc.severity}`}>{inc.severity}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{inc.title}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                {inc.service} · {inc.namespace}
              </div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, color: STATUS_COLOR[inc.status] || "#6b7280",
              textTransform: "uppercase", letterSpacing: "0.05em",
            }}>
              ● {inc.status}
            </span>
            <span style={{ fontSize: 11, color: "#4a5568" }}>
              {inc.started_at?.slice(11, 16)} UTC
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
