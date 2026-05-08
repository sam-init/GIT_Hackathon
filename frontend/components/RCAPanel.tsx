"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#EF4444",
  high:     "#F59E0B",
  medium:   "#FBBF24",
  low:      "#10B981",
};

const SEVERITY_BG: Record<string, string> = {
  critical: "rgba(239,68,68,0.07)",
  high:     "rgba(245,158,11,0.07)",
  medium:   "rgba(251,191,36,0.07)",
  low:      "rgba(16,185,129,0.07)",
};

const SEVERITY_BORDER: Record<string, string> = {
  critical: "rgba(239,68,68,0.2)",
  high:     "rgba(245,158,11,0.2)",
  medium:   "rgba(251,191,36,0.15)",
  low:      "rgba(16,185,129,0.18)",
};

interface RCA {
  root_cause: string;
  evidence: string[];
  affected_services: string[];
  confidence_score: number;
  remediation: string[];
  kubectl_commands: string[];
  summary: string;
}

// ── Section header ─────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "#475569",
      marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

// ── Copy button with success state ─────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy command"}
      style={{
        position: "absolute",
        top: "50%",
        right: 10,
        transform: "translateY(-50%)",
        padding: "3px 8px",
        borderRadius: 4,
        fontSize: 9,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "Inter, sans-serif",
        letterSpacing: "0.04em",
        transition: "all 0.15s ease",
        border: copied ? "1px solid rgba(16,185,129,0.35)" : "1px solid #1E293B",
        background: copied ? "rgba(16,185,129,0.1)" : "rgba(30,41,59,0.8)",
        color: copied ? "#6EE7B7" : "#64748B",
        opacity: 1,
      }}
      onMouseEnter={(e) => {
        if (!copied) {
          e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)";
          e.currentTarget.style.color = "#38BDF8";
        }
      }}
      onMouseLeave={(e) => {
        if (!copied) {
          e.currentTarget.style.borderColor = "#1E293B";
          e.currentTarget.style.color = "#64748B";
        }
      }}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────
export function RCAPanel({ rca, severity }: { rca: RCA; severity: string }) {
  const color  = SEVERITY_COLORS[severity] || "#6B7280";
  const bg     = SEVERITY_BG[severity]     || "rgba(107,114,128,0.06)";
  const border = SEVERITY_BORDER[severity] || "rgba(107,114,128,0.18)";
  const conf   = rca.confidence_score || 0;
  const confColor = conf >= 85 ? "#10B981" : conf >= 70 ? "#F59E0B" : "#EF4444";

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Root cause card */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div style={{
          padding: "16px 18px",
          borderRadius: 8,
          background: bg,
          border: `1px solid ${border}`,
        }}>
          <SectionLabel>Root Cause</SectionLabel>
          <div style={{ fontSize: 13, color: "#E2E8F0", lineHeight: 1.65, fontWeight: 500 }}>
            {rca.root_cause}
          </div>

          {/* AI Confidence bar */}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
              <span style={{ fontSize: 10, color: "#64748B", fontWeight: 500 }}>AI Confidence</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: confColor }}>{conf}%</span>
            </div>
            <div style={{ height: 3, borderRadius: 2, background: "#1E293B", overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${conf}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                style={{ height: "100%", borderRadius: 2, background: confColor }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary */}
      {rca.summary && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}>
          <SectionLabel>Summary</SectionLabel>
          <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.75 }}>
            {rca.summary}
          </div>
        </motion.div>
      )}

      {/* Evidence */}
      {rca.evidence?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
          <SectionLabel>Evidence</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rca.evidence.map((e, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#F59E0B",
                  flexShrink: 0,
                  marginTop: 6,
                }} />
                <span style={{ fontSize: 12, color: "#CBD5E1", lineHeight: 1.55 }}>{e}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Affected services */}
      {rca.affected_services?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}>
          <SectionLabel>Affected Services</SectionLabel>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {rca.affected_services.map((s) => (
              <span key={s} style={{
                padding: "3px 9px",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 500,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#F87171",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {s}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Remediation steps */}
      {rca.remediation?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <SectionLabel>Remediation</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rca.remediation.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.22)",
                  color: "#10B981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 800,
                  flexShrink: 0,
                  marginTop: 1,
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 12, color: "#E2E8F0", lineHeight: 1.6, paddingTop: 1 }}>
                  {r}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* kubectl commands — with per-line copy buttons */}
      {rca.kubectl_commands?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <SectionLabel>kubectl Commands</SectionLabel>
            {/* Copy all button */}
            <CopyAllButton commands={rca.kubectl_commands} />
          </div>

          <div style={{
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid #1E293B",
            background: "#0B1020",
          }}>
            {rca.kubectl_commands.map((cmd, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 14px",
                  background: i % 2 === 0 ? "#0B1020" : "#0F172A",
                  borderBottom: i < rca.kubectl_commands.length - 1 ? "1px solid #1E293B" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  position: "relative",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#111827"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? "#0B1020" : "#0F172A"; }}
              >
                {/* Prompt symbol */}
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: "#334155",
                  flexShrink: 0,
                  userSelect: "none",
                }}>$</span>

                {/* Command text */}
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: "#94A3B8",
                  flex: 1,
                  paddingRight: 60,
                  wordBreak: "break-all",
                }}>
                  {cmd}
                </span>

                {/* Per-line copy button */}
                <CopyButton text={cmd} />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Copy-all button (top-right of section) ─────────────────
function CopyAllButton({ commands }: { commands: string[] }) {
  const [copied, setCopied] = useState(false);

  async function handleCopyAll() {
    const text = commands.join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <button
      onClick={handleCopyAll}
      style={{
        padding: "3px 9px",
        borderRadius: 4,
        fontSize: 9,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "Inter, sans-serif",
        letterSpacing: "0.04em",
        transition: "all 0.15s ease",
        border: copied ? "1px solid rgba(16,185,129,0.35)" : "1px solid #1E293B",
        background: copied ? "rgba(16,185,129,0.1)" : "transparent",
        color: copied ? "#6EE7B7" : "#64748B",
        marginBottom: 2,
      }}
    >
      {copied ? "✓ All copied" : "Copy all"}
    </button>
  );
}
