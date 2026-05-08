"use client";
import { Handle, Position, NodeProps } from "reactflow";

const STATUS_COLORS: Record<string, string> = {
  healthy:  "#10B981",
  warning:  "#F59E0B",
  critical: "#EF4444",
  unknown:  "#6B7280",
};

// Subtle tinted backgrounds — enterprise card feel, no rainbow
const NODE_TYPE_ACCENT: Record<string, { bg: string; border: string; label: string }> = {
  service:           { bg: "#0F2235", border: "#1E3A5F", label: "SVC" },
  pod:               { bg: "#140F2B", border: "#2D1E5E", label: "POD" },
  database:          { bg: "#1A1400", border: "#3D3000", label: "DB" },
  cache:             { bg: "#1A0F1A", border: "#3D1E3D", label: "CACHE" },
  "message-queue":   { bg: "#0D1A11", border: "#1E3D25", label: "MQ" },
  ingress:           { bg: "#061A1E", border: "#0E3540", label: "ING" },
  "service-account": { bg: "#0F0F2B", border: "#1E1E5E", label: "SA" },
  "cluster-role":    { bg: "#1A0A0A", border: "#3D1515", label: "CR" },
  secret:            { bg: "#1A0A0A", border: "#3D1515", label: "SEC" },
  unknown:           { bg: "#111827", border: "#1E293B", label: "?" },
};

// Text icons (no emoji on node cards for clarity)
const NODE_ICONS: Record<string, string> = {
  service:           "⬡",
  pod:               "◉",
  database:          "▪",
  cache:             "⚡",
  "message-queue":   "⇉",
  ingress:           "⊕",
  "service-account": "⊘",
  "cluster-role":    "◈",
  secret:            "⊞",
  unknown:           "◆",
};

export function KubeNode({ data }: NodeProps) {
  const status    = data.status || "healthy";
  const statColor = STATUS_COLORS[status] || STATUS_COLORS.unknown;
  const icon      = NODE_ICONS[data.type] || NODE_ICONS.unknown;
  const typeStyle = NODE_TYPE_ACCENT[data.type] || NODE_TYPE_ACCENT.unknown;
  const isAlert   = status === "critical" || status === "warning";

  // Status-driven border: subtle base + severity accent on alert
  const borderColor = isAlert ? statColor : typeStyle.border;
  const cardBg      = typeStyle.bg;

  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        padding: "9px 12px 10px",
        minWidth: 130,
        maxWidth: 165,
        boxShadow: isAlert
          ? `0 2px 10px rgba(0,0,0,0.5), inset 0 0 0 1px ${statColor}22`
          : "0 1px 6px rgba(0,0,0,0.4)",
        transition: "all 0.2s ease",
        cursor: "pointer",
        position: "relative",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: statColor, border: "none", width: 5, height: 5, top: -3 }}
      />

      {/* Type label chip */}
      <div style={{
        position: "absolute",
        top: 7,
        right: 9,
        fontSize: 8,
        fontWeight: 700,
        color: typeStyle.border,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        fontFamily: "inherit",
      }}>
        {typeStyle.label}
      </div>

      {/* Icon + status dot row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 14, color: "#CBD5E1", opacity: 0.8 }}>{icon}</span>
        <div style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: statColor,
          flexShrink: 0,
          // subtle pulse for critical only — no glow rings
          animation: status === "critical" ? "status-pulse 1.5s ease-in-out infinite" : "none",
        }} />
      </div>

      {/* Label */}
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        color: "#E2E8F0",
        lineHeight: 1.35,
        wordBreak: "break-word",
        paddingRight: 24, // space for type chip
      }}>
        {data.label}
      </div>

      {/* Namespace */}
      <div style={{
        fontSize: 9,
        color: "#4B5563",
        marginTop: 3,
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: "0.02em",
      }}>
        {data.namespace}
      </div>

      {/* Status line for non-healthy */}
      {status !== "healthy" && (
        <div style={{
          marginTop: 6,
          paddingTop: 5,
          borderTop: `1px solid ${statColor}28`,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: statColor, flexShrink: 0 }} />
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            color: statColor,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}>
            {status}
          </span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: statColor, border: "none", width: 5, height: 5, bottom: -3 }}
      />
    </div>
  );
}
