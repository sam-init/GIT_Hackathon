"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Incident {
  id: string; title: string; severity: string; status: string;
  service: string; namespace: string; started_at: string; blast_radius?: string[];
}

const SEV_COLOR: Record<string, string> = {
  critical: "#ef4444", high: "#f59e0b", medium: "#fde68a", low: "#10b981",
};
const STATUS_COLOR: Record<string, string> = {
  active: "#ef4444", investigating: "#f59e0b", resolved: "#10b981",
};

export function IncidentPanel({ incidents }: { incidents: Incident[] }) {
  const active = incidents.filter(i => i.status !== "resolved");
  const resolved = incidents.filter(i => i.status === "resolved");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 0 }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px 12px", borderBottom: "1px solid #1e2d45",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulse-red 1s infinite" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.08em" }}>
            ACTIVE INCIDENTS
          </span>
        </div>
        <span style={{
          background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
          color: "#f87171", borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 700,
        }}>{active.length}</span>
      </div>

      {/* Incidents list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        <AnimatePresence>
          {active.length === 0 && (
            <div style={{ padding: "24px 20px", textAlign: "center", color: "#4a5568" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
              <div style={{ fontSize: 13 }}>All systems healthy</div>
            </div>
          )}
          {active.map((inc, i) => (
            <motion.div
              key={inc.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/incidents/${inc.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  margin: "4px 12px", padding: "12px 14px", borderRadius: 8,
                  background: "rgba(17,24,39,0.6)", border: `1px solid ${SEV_COLOR[inc.severity] || "#1e2d45"}22`,
                  cursor: "pointer", transition: "all 0.2s",
                  boxShadow: inc.severity === "critical" ? `0 0 12px ${SEV_COLOR.critical}22` : "none",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(26,34,53,0.8)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(17,24,39,0.6)")}
                >
                  {/* Top row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span className={`badge badge-${inc.severity}`}>{inc.severity}</span>
                    <span style={{ fontSize: 10, color: "#4a5568", marginLeft: "auto" }}>
                      {inc.id}
                    </span>
                  </div>

                  {/* Title */}
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", marginBottom: 4, lineHeight: 1.4 }}>
                    {inc.title}
                  </div>

                  {/* Meta */}
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, color: "#06b6d4" }}>{inc.service}</span>
                    <span style={{ fontSize: 10, color: "#4a5568" }}>·</span>
                    <span style={{ fontSize: 10, color: "#4a5568" }}>{inc.namespace}</span>
                    {inc.blast_radius && inc.blast_radius.length > 0 && (
                      <>
                        <span style={{ fontSize: 10, color: "#4a5568" }}>·</span>
                        <span style={{ fontSize: 10, color: "#f59e0b" }}>
                          💥 {inc.blast_radius.length} affected
                        </span>
                      </>
                    )}
                  </div>

                  {/* Status + time */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, alignItems: "center" }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: STATUS_COLOR[inc.status] || "#6b7280",
                      textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                      ● {inc.status}
                    </span>
                    <span style={{ fontSize: 10, color: "#4a5568" }}>
                      {inc.started_at?.slice(11, 16)} UTC
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Resolved section */}
        {resolved.length > 0 && (
          <>
            <div style={{ padding: "12px 20px 6px", fontSize: 11, fontWeight: 600, color: "#4a5568", letterSpacing: "0.08em" }}>
              RESOLVED ({resolved.length})
            </div>
            {resolved.map(inc => (
              <Link key={inc.id} href={`/incidents/${inc.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  margin: "2px 12px", padding: "10px 14px", borderRadius: 8,
                  background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)",
                  opacity: 0.7, cursor: "pointer",
                }}>
                  <div style={{ fontSize: 11, color: "#6ee7b7", fontWeight: 600 }}>{inc.title}</div>
                  <div style={{ fontSize: 10, color: "#4a5568", marginTop: 2 }}>{inc.service} · resolved</div>
                </div>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
