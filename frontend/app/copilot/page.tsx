import { Navbar } from "@/components/Navbar";
import { AICopilot } from "@/components/AICopilot";

const CAPABILITIES = [
  { icon: "⬡", title: "Topology Awareness",      desc: "Understands service dependencies and relationships" },
  { icon: "◎", title: "Blast Radius Analysis",   desc: "Identifies downstream impact of failures" },
  { icon: "◈", title: "Attack Path Reasoning",   desc: "Explains RBAC escalation and lateral movement" },
  { icon: "▪", title: "RCA Generation",          desc: "Root cause analysis with evidence and confidence" },
  { icon: "◆", title: "Remediation Steps",       desc: "kubectl commands and fix recommendations" },
];

const SUGGESTED_QUERIES = [
  "Why is auth-service crashing?",
  "What's the blast radius of postgres failure?",
  "Explain the RBAC attack path",
  "How do I fix the Redis OOMKilled issue?",
  "What changed before the last incident?",
  "Show me high-risk services",
];

const META = [
  { label: "CONTEXT", value: "Full cluster" },
  { label: "MODEL",   value: "Llama 3.1 70B" },
  { label: "MODE",    value: "SRE Expert" },
];

export default function CopilotPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Left capabilities sidebar */}
        <div style={{
          width: 260,
          borderRight: "1px solid #1E293B",
          padding: "24px 16px",
          background: "#0F172A",
          overflowY: "auto",
          flexShrink: 0,
        }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#334155",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}>
              Capabilities
            </div>
            {CAPABILITIES.map((c) => (
              <div key={c.title} style={{
                marginBottom: 8,
                padding: "11px 12px",
                borderRadius: 7,
                background: "#111827",
                border: "1px solid #1E293B",
                transition: "border-color 0.15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: "#38BDF8" }}>{c.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#E2E8F0" }}>{c.title}</span>
                </div>
                <div style={{ fontSize: 11, color: "#4B5563", lineHeight: 1.5, paddingLeft: 20 }}>
                  {c.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Suggested queries */}
          <div>
            <div style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#334155",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}>
              Suggested Queries
            </div>
            {SUGGESTED_QUERIES.map((q) => (
              <div key={q} style={{
                padding: "8px 10px",
                borderRadius: 6,
                marginBottom: 5,
                fontSize: 11,
                color: "#64748B",
                cursor: "pointer",
                lineHeight: 1.4,
                border: "1px solid #1E293B",
                transition: "all 0.15s",
              }}>
                {q}
              </div>
            ))}
          </div>
        </div>

        {/* Main chat area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0B1020" }}>
          {/* Chat header */}
          <div style={{
            padding: "14px 20px",
            borderBottom: "1px solid #1E293B",
            background: "#0F172A",
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexShrink: 0,
          }}>
            {/* Icon */}
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "rgba(56,189,248,0.1)",
              border: "1px solid rgba(56,189,248,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              color: "#38BDF8",
              flexShrink: 0,
            }}>◎</div>

            <div>
              <div style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#E2E8F0",
                letterSpacing: "-0.01em",
              }}>
                KubeGraph Sentinel Copilot
              </div>
              <div style={{ fontSize: 11, color: "#475569" }}>
                Infrastructure-aware · Graph-native · NVIDIA Powered
              </div>
            </div>

            {/* Meta chips */}
            <div style={{
              marginLeft: "auto",
              display: "flex",
              gap: 16,
              alignItems: "center",
            }}>
              {META.map((m) => (
                <div key={m.label} style={{ textAlign: "center" }}>
                  <div style={{
                    fontSize: 8,
                    color: "#334155",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 2,
                  }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B" }}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat body */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            <AICopilot />
          </div>
        </div>
      </div>
    </div>
  );
}
