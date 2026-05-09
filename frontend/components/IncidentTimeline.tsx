"use client";
import { motion } from "framer-motion";

interface TimelineEvent {
  time: string; event: string; type: string;
}

const TYPE_COLORS: Record<string, string> = {
  deployment:   "#38BDF8",
  warning:      "#F59E0B",
  error:        "#EF4444",
  detection:    "#8B5CF6",
  remediation:  "#10B981",
  resolved:     "#10B981",
  security:     "#EF4444",
};

const TYPE_LABELS: Record<string, string> = {
  deployment:  "deploy",
  warning:     "warn",
  error:       "error",
  detection:   "detect",
  remediation: "fix",
  resolved:    "resolved",
  security:    "security",
};

export function IncidentTimeline({ events }: { events: TimelineEvent[] }) {
  if (!events || events.length === 0) return (
    <div style={{ padding: "24px 20px", color: "#4B5563", textAlign: "center", fontSize: 12 }}>
      No timeline events
    </div>
  );

  return (
    <div style={{ padding: "14px 20px", position: "relative" }}>
      {/* Vertical rail */}
      <div style={{
        position: "absolute",
        left: 34,
        top: 22,
        bottom: 22,
        width: 1,
        background: "linear-gradient(to bottom, var(--border) 70%, transparent)",
      }} />

      {events.map((ev, i) => {
        const color = TYPE_COLORS[ev.type] || "#6B7280";
        const label = TYPE_LABELS[ev.type] || ev.type;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start" }}
          >
            {/* Timeline dot */}
            <div style={{
              width: 24,
              height: 24,
              borderRadius: 0,
              flexShrink: 0,
              background: "var(--bg-panel)",
              border: `1.5px solid ${color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: 0,
                background: color,
              }} />
            </div>

            {/* Content */}
            <div style={{ paddingTop: 3, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{
                  fontSize: 8,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color,
                  background: `${color}12`,
                  border: `1px solid ${color}25`,
                  padding: "1px 5px",
                  borderRadius: 0,
                }}>
                  {label}
                </span>
                <span style={{
                  fontSize: 9,
                  color: "#334155",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {ev.time} UTC
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#CBD5E1", lineHeight: 1.5 }}>
                {ev.event}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
