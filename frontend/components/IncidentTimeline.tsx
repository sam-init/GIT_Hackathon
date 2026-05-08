"use client";
import { motion } from "framer-motion";

interface TimelineEvent {
  time: string; event: string; type: string;
}

const TYPE_COLORS: Record<string, string> = {
  deployment: "#3b82f6",
  warning: "#f59e0b",
  error: "#ef4444",
  detection: "#8b5cf6",
  remediation: "#10b981",
  resolved: "#10b981",
  security: "#ef4444",
};
const TYPE_ICONS: Record<string, string> = {
  deployment: "🚀", warning: "⚠️", error: "💥",
  detection: "🔍", remediation: "🔧", resolved: "✅", security: "🔒",
};

export function IncidentTimeline({ events }: { events: TimelineEvent[] }) {
  if (!events || events.length === 0) return (
    <div style={{ padding: "24px", color: "#4a5568", textAlign: "center", fontSize: 12 }}>
      No timeline events yet
    </div>
  );

  return (
    <div style={{ padding: "16px 20px", position: "relative" }}>
      {/* Vertical line */}
      <div style={{
        position: "absolute", left: 36, top: 16, bottom: 16,
        width: 1, background: "linear-gradient(to bottom, #1e2d45, transparent)",
      }} />

      {events.map((ev, i) => {
        const color = TYPE_COLORS[ev.type] || "#6b7280";
        const icon = TYPE_ICONS[ev.type] || "●";
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "flex-start" }}
          >
            {/* Dot */}
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: `${color}22`, border: `1.5px solid ${color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, boxShadow: `0 0 8px ${color}44`,
            }}>
              {icon}
            </div>

            {/* Content */}
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "JetBrains Mono, monospace", marginBottom: 2 }}>
                {ev.time} UTC
              </div>
              <div style={{ fontSize: 12, color: "#e2e8f0", lineHeight: 1.4 }}>
                {ev.event}
              </div>
              <span style={{
                fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em",
                color, marginTop: 2, display: "inline-block",
              }}>
                {ev.type}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
