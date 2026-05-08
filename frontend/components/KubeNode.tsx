"use client";
import { Handle, Position, NodeProps } from "reactflow";

const STATUS_COLORS: Record<string, string> = {
  healthy: "#10b981",
  warning: "#f59e0b",
  critical: "#ef4444",
  unknown: "#6b7280",
};

const NODE_ICONS: Record<string, string> = {
  service: "⬡",
  pod: "◉",
  database: "🗄",
  cache: "⚡",
  "message-queue": "📨",
  ingress: "🌐",
  "service-account": "👤",
  "cluster-role": "🔑",
  secret: "🔒",
  unknown: "◆",
};

const NODE_BG: Record<string, string> = {
  service: "rgba(59,130,246,0.12)",
  pod: "rgba(139,92,246,0.12)",
  database: "rgba(245,158,11,0.12)",
  cache: "rgba(236,72,153,0.12)",
  "message-queue": "rgba(16,185,129,0.12)",
  ingress: "rgba(6,182,212,0.12)",
  "service-account": "rgba(99,102,241,0.12)",
  "cluster-role": "rgba(239,68,68,0.15)",
  secret: "rgba(239,68,68,0.1)",
  unknown: "rgba(107,114,128,0.1)",
};

export function KubeNode({ data }: NodeProps) {
  const status = data.status || "healthy";
  const color = STATUS_COLORS[status] || STATUS_COLORS.unknown;
  const icon = NODE_ICONS[data.type] || NODE_ICONS.unknown;
  const bg = NODE_BG[data.type] || NODE_BG.unknown;
  const isAlert = status === "critical" || status === "warning";

  return (
    <div
      style={{
        background: bg,
        border: `1.5px solid ${color}`,
        borderRadius: 10,
        padding: "10px 14px",
        minWidth: 130,
        maxWidth: 170,
        boxShadow: isAlert ? `0 0 16px ${color}55` : "0 2px 8px rgba(0,0,0,0.4)",
        transition: "all 0.4s ease",
        cursor: "pointer",
        position: "relative",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: color, border: "none", width: 6, height: 6 }} />

      {/* Pulse ring for alerts */}
      {isAlert && (
        <div style={{
          position: "absolute", inset: -4, borderRadius: 14,
          border: `1px solid ${color}`,
          animation: status === "critical" ? "pulse-red 1s infinite" : "pulse-yellow 1.5s infinite",
          pointerEvents: "none",
        }} />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <div style={{
          width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0,
          boxShadow: `0 0 6px ${color}`,
        }} />
      </div>

      <div style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.3, wordBreak: "break-word" }}>
        {data.label}
      </div>
      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
        {data.type} · {data.namespace}
      </div>
      {status !== "healthy" && (
        <div style={{ fontSize: 10, fontWeight: 700, color, marginTop: 4, textTransform: "uppercase" }}>
          ⚡ {status}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: color, border: "none", width: 6, height: 6 }} />
    </div>
  );
}
