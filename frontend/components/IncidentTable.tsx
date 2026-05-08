"use client";

interface Incident {
  id: string; title: string; severity: string; status: string;
  service: string; namespace: string; started_at: string;
}

const SEV_COLOR: Record<string, string> = {
  critical: "#EF4444", high: "#F59E0B", medium: "#FBBF24", low: "#10B981",
};
const STATUS_COLOR: Record<string, string> = {
  active: "#EF4444", investigating: "#F59E0B", resolved: "#10B981",
};

export function IncidentTable({ incidents }: { incidents: Incident[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {incidents.map((inc) => (
        <a
          key={inc.id}
          href={`/incidents/${inc.id}`}
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
              padding: "13px 18px",
              borderRadius: 0,
              background: "var(--bg-panel)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: 14,
              transition: "all 0.15s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-panel-hover)";
              e.currentTarget.style.borderColor = "var(--border-medium)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-panel)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            {/* Severity badge */}
            <span className={`badge badge-${inc.severity}`}>{inc.severity}</span>

            {/* Title + meta */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#E2E8F0",
                marginBottom: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {inc.title}
              </div>
              <div style={{ fontSize: 11, color: "#64748B" }}>
                <span style={{ color: "#38BDF8" }}>{inc.service}</span>
                {" · "}
                {inc.namespace}
              </div>
            </div>

            {/* Status */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
              <div style={{
                width: 5,
                height: 5,
                borderRadius: 0,
                background: STATUS_COLOR[inc.status] || "#6B7280",
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: STATUS_COLOR[inc.status] || "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}>
                {inc.status}
              </span>
            </div>

            {/* Time */}
            <span style={{
              fontSize: 11,
              color: "#334155",
              flexShrink: 0,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {inc.started_at?.slice(11, 16)} UTC
            </span>

            {/* Arrow */}
            <span style={{ color: "#334155", fontSize: 12, flexShrink: 0 }}>›</span>
          </div>
        </a>
      ))}
    </div>
  );
}
