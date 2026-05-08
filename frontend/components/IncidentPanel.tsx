"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

interface Incident {
  id: string; title: string; severity: string; status: string;
  service: string; namespace: string; started_at: string; blast_radius?: string[];
}

const SEV_COLOR: Record<string, string> = {
  critical: "#EF4444", high: "#F59E0B", medium: "#FBBF24", low: "#10B981",
};
const STATUS_COLOR: Record<string, string> = {
  active: "#EF4444", investigating: "#F59E0B", resolved: "#10B981",
};

function timeSince(iso: string) {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  } catch { return ""; }
}

export function IncidentPanel({ incidents }: { incidents: Incident[] }) {
  const active   = incidents.filter((i) => i.status !== "resolved");
  const resolved = incidents.filter((i) => i.status === "resolved");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{
        padding: "13px 16px",
        borderBottom: "1px solid #1E293B",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="status-dot live" style={{
            background: active.length > 0 ? "#EF4444" : "#10B981",
            animation: active.length > 0 ? "status-pulse 1.5s ease-in-out infinite" : "none",
          }} />
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#E2E8F0",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
          }}>
            Active Incidents
          </span>
        </div>
        {active.length > 0 && (
          <span style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.22)",
            color: "#F87171",
            borderRadius: 4,
            padding: "2px 8px",
            fontSize: 11,
            fontWeight: 700,
          }}>
            {active.length}
          </span>
        )}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
        <AnimatePresence>
          {active.length === 0 && (
            <div style={{ padding: "28px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 18, color: "#10B981", marginBottom: 6 }}>✓</div>
              <div style={{ fontSize: 12, color: "#4B5563" }}>All systems healthy</div>
            </div>
          )}

          {active.map((inc, i) => (
            <motion.div
              key={inc.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
            >
              <Link href={`/incidents/${inc.id}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    margin: "3px 10px",
                    padding: "11px 13px",
                    borderRadius: 7,
                    background: "#111827",
                    border: `1px solid ${SEV_COLOR[inc.severity] || "#1E293B"}1A`,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1E293B";
                    e.currentTarget.style.borderColor = `${SEV_COLOR[inc.severity] || "#38BDF8"}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#111827";
                    e.currentTarget.style.borderColor = `${SEV_COLOR[inc.severity] || "#1E293B"}1A`;
                  }}
                >
                  {/* Top row: badge + ID */}
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                    <span className={`badge badge-${inc.severity}`}>{inc.severity}</span>
                    <span style={{ fontSize: 9, color: "#334155", marginLeft: "auto", fontFamily: "monospace" }}>
                      {inc.id}
                    </span>
                  </div>

                  {/* Title */}
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#E2E8F0",
                    marginBottom: 5,
                    lineHeight: 1.4,
                  }}>
                    {inc.title}
                  </div>

                  {/* Meta row */}
                  <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, color: "#38BDF8" }}>{inc.service}</span>
                    <span style={{ fontSize: 10, color: "#334155" }}>·</span>
                    <span style={{ fontSize: 10, color: "#475569" }}>{inc.namespace}</span>
                    {inc.blast_radius && inc.blast_radius.length > 0 && (
                      <>
                        <span style={{ fontSize: 10, color: "#334155" }}>·</span>
                        <span style={{ fontSize: 10, color: "#F59E0B" }}>
                          {inc.blast_radius.length} affected
                        </span>
                      </>
                    )}
                  </div>

                  {/* Status + time */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 7,
                    alignItems: "center",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: STATUS_COLOR[inc.status] || "#6B7280",
                        flexShrink: 0,
                      }} />
                      <span style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: STATUS_COLOR[inc.status] || "#6B7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}>
                        {inc.status}
                      </span>
                    </div>
                    <span style={{ fontSize: 10, color: "#334155" }}>
                      {timeSince(inc.started_at)}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Resolved */}
        {resolved.length > 0 && (
          <>
            <div style={{
              padding: "10px 16px 5px",
              fontSize: 9,
              fontWeight: 700,
              color: "#334155",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginTop: 4,
            }}>
              Resolved · {resolved.length}
            </div>
            {resolved.map((inc) => (
              <Link key={inc.id} href={`/incidents/${inc.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  margin: "2px 10px",
                  padding: "9px 13px",
                  borderRadius: 7,
                  background: "rgba(16,185,129,0.04)",
                  border: "1px solid rgba(16,185,129,0.1)",
                  opacity: 0.65,
                  cursor: "pointer",
                  transition: "opacity 0.15s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.65"; }}
                >
                  <div style={{ fontSize: 11, color: "#6EE7B7", fontWeight: 600 }}>{inc.title}</div>
                  <div style={{ fontSize: 10, color: "#334155", marginTop: 2 }}>
                    {inc.service} · resolved
                  </div>
                </div>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
