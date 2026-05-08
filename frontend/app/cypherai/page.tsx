import { Navbar } from "@/components/Navbar";

export default function CypherAIPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar />
      <div style={{ flex: 1, display: "flex", overflow: "hidden", background: "#0B1020" }}>

        {/* Content */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          textAlign: "center",
        }}>
          {/* Icon */}
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: "rgba(56,189,248,0.08)",
            border: "1px solid rgba(56,189,248,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            color: "#38BDF8",
            marginBottom: 20,
          }}>
            ⟡
          </div>

          <div style={{
            fontSize: 9,
            fontWeight: 700,
            color: "#334155",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}>
            CypherAI
          </div>

          <h1 style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#E2E8F0",
            letterSpacing: "-0.02em",
            marginBottom: 10,
            lineHeight: 1.2,
          }}>
            CypherAI Module
          </h1>

          <p style={{
            fontSize: 14,
            color: "#64748B",
            maxWidth: 440,
            lineHeight: 1.7,
            marginBottom: 32,
          }}>
            Advanced AI-powered security intelligence and automated threat analysis.
            This module is under active development.
          </p>

          {/* Feature list */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            maxWidth: 600,
            marginBottom: 36,
          }}>
            {[
              { label: "Threat Detection",     desc: "ML-based anomaly identification" },
              { label: "Security Graph",        desc: "RBAC and privilege analysis" },
              { label: "Auto Remediation",      desc: "Intelligent response workflows" },
            ].map((f) => (
              <div key={f.label} style={{
                padding: "14px 16px",
                borderRadius: 7,
                background: "#111827",
                border: "1px solid #1E293B",
                textAlign: "left",
              }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#94A3B8",
                  marginBottom: 4,
                }}>
                  {f.label}
                </div>
                <div style={{ fontSize: 11, color: "#4B5563", lineHeight: 1.5 }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 14px",
            borderRadius: 5,
            background: "rgba(56,189,248,0.07)",
            border: "1px solid rgba(56,189,248,0.15)",
            fontSize: 11,
            fontWeight: 500,
            color: "#38BDF8",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#38BDF8", animation: "status-pulse 2s ease-in-out infinite", display: "inline-block" }} />
            Coming soon
          </div>
        </div>
      </div>
    </div>
  );
}
