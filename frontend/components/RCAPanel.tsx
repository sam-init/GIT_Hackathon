"use client";
import { motion } from "framer-motion";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444", high: "#f59e0b", medium: "#fde68a", low: "#10b981",
};

interface RCA {
  root_cause: string; evidence: string[]; affected_services: string[];
  confidence_score: number; remediation: string[]; kubectl_commands: string[];
  summary: string;
}

export function RCAPanel({ rca, severity }: { rca: RCA; severity: string }) {
  const color = SEVERITY_COLORS[severity] || "#6b7280";
  const conf = rca.confidence_score || 0;
  const confColor = conf >= 85 ? "#10b981" : conf >= 70 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ padding: "20px" }}>
      {/* Root cause */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{
          padding: "16px", borderRadius: 10,
          background: `${color}11`, border: `1px solid ${color}44`,
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: "0.1em", marginBottom: 8 }}>
            ⚡ ROOT CAUSE
          </div>
          <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.6, fontWeight: 500 }}>
            {rca.root_cause}
          </div>
          {/* Confidence */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: "#94a3b8" }}>AI Confidence</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: confColor }}>{conf}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: "#1e2d45", overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${conf}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${confColor}, ${confColor}aa)` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary */}
      {rca.summary && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", marginBottom: 8 }}>📋 SUMMARY</div>
          <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7 }}>{rca.summary}</div>
        </motion.div>
      )}

      {/* Evidence */}
      {rca.evidence?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", marginBottom: 8 }}>🔎 EVIDENCE</div>
          {rca.evidence.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
              <span style={{ color: "#f59e0b", fontSize: 10, marginTop: 2 }}>▸</span>
              <span style={{ fontSize: 12, color: "#e2e8f0", lineHeight: 1.5 }}>{e}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Affected services */}
      {rca.affected_services?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", marginBottom: 8 }}>💥 AFFECTED SERVICES</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {rca.affected_services.map(s => (
              <span key={s} style={{
                padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500,
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171",
              }}>{s}</span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Remediation */}
      {rca.remediation?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#10b981", letterSpacing: "0.1em", marginBottom: 8 }}>🔧 REMEDIATION</div>
          {rca.remediation.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%", background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.3)", color: "#10b981",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, flexShrink: 0,
              }}>{i + 1}</div>
              <span style={{ fontSize: 12, color: "#e2e8f0", lineHeight: 1.5, paddingTop: 2 }}>{r}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Kubectl commands */}
      {rca.kubectl_commands?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", marginBottom: 8 }}>⌨️ KUBECTL COMMANDS</div>
          <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #1e2d45" }}>
            {rca.kubectl_commands.map((cmd, i) => (
              <div key={i} style={{
                padding: "10px 14px",
                background: i % 2 === 0 ? "rgba(8,12,20,0.8)" : "rgba(13,20,32,0.8)",
                fontFamily: "JetBrains Mono, monospace", fontSize: 11,
                color: "#06b6d4", borderBottom: i < rca.kubectl_commands.length - 1 ? "1px solid #0d1420" : "none",
              }}>
                <span style={{ color: "#4a5568" }}>$ </span>{cmd}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
