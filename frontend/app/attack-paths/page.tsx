import { Navbar } from "@/components/Navbar";
import { AIStyledMarkdown } from "@/components/AIStyledMarkdown";
import { explainAttackPaths, fetchAttackPaths } from "@/lib/api";

export const dynamic = "force-dynamic";

interface AttackPath {
  entry: string;
  role: string;
  path: string[];
  accessible_secrets: string[];
  risk_score: number;
  type: string;
}

interface AttackExplanation {
  explanation?: string;
}

export default async function AttackPathsPage() {
  let paths: AttackPath[] = [];
  let explanation: AttackExplanation = {};
  try {
    paths = await fetchAttackPaths();
  } catch {}
  try {
    explanation = await explainAttackPaths();
  } catch {}

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar />

      <div style={{ flex: 1, overflowY: "auto", background: "#0B1020" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 24px 32px" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 8 }}>
              Security
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#E2E8F0", lineHeight: 1.25, letterSpacing: "-0.02em" }}>
                  Attack Path Analysis
                </h1>
                <p style={{ marginTop: 6, fontSize: 12, color: "#64748B" }}>
                  RBAC privilege escalation and lateral movement risk
                </p>
              </div>
              {paths.length > 0 && (
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 6, padding: "6px 12px", color: "#F87171", fontSize: 11, fontWeight: 700 }}>
                  {paths.length} Path{paths.length === 1 ? "" : "s"} Detected
                </div>
              )}
            </div>
          </div>

          {paths.length === 0 ? (
            <div style={{ borderRadius: 8, background: "#111827", border: "1px solid #1E293B", padding: "54px 22px", textAlign: "center" }}>
              <div style={{ fontSize: 34, color: "#10B981", marginBottom: 10 }}>✓</div>
              <div style={{ fontSize: 16, color: "#E2E8F0", fontWeight: 600 }}>No attack paths detected</div>
              <div style={{ marginTop: 6, fontSize: 12, color: "#64748B" }}>All RBAC relationships appear to follow least privilege.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {paths.map((path, index) => (
                <div key={`${path.entry}-${index}`} style={{ borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)", background: "#111827", overflow: "hidden" }}>
                  <div style={{ padding: "12px 18px", borderBottom: "1px solid rgba(239,68,68,0.12)", background: "rgba(239,68,68,0.03)", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#F87171", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>
                      Path {index + 1}
                    </span>
                    <span style={{ fontSize: 13, color: "#E2E8F0", fontWeight: 600 }}>{path.type}</span>
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "#64748B" }}>
                      Risk: <span style={{ color: "#EF4444", fontWeight: 700 }}>{path.risk_score}/100</span>
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20, padding: "16px 18px" }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#475569", marginBottom: 10 }}>
                        Escalation Chain
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {path.path.map((step, stepIndex) => (
                          <div key={`${step}-${stepIndex}`} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 18, height: 18, borderRadius: 4, border: "1px solid rgba(239,68,68,0.22)", background: "rgba(239,68,68,0.08)", color: "#F87171", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {stepIndex + 1}
                            </div>
                            <div style={{ fontSize: 12, color: "#CBD5E1", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.55 }}>{step}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#475569", marginBottom: 10 }}>
                        Entry Point
                      </div>
                      <div style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.07)", color: "#FCD34D", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginBottom: 14 }}>
                        {path.entry}
                      </div>

                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#475569", marginBottom: 8 }}>
                        Accessible Secrets
                      </div>
                      {path.accessible_secrets?.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {path.accessible_secrets.map((secret) => (
                            <div key={secret} style={{ padding: "7px 10px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.18)", background: "rgba(239,68,68,0.06)", color: "#F87171", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                              {secret}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: "#64748B" }}>No secrets directly accessible</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {explanation.explanation && (
            <div style={{ marginTop: 18, borderRadius: 8, border: "1px solid #1E293B", background: "#111827", overflow: "hidden" }}>
              <div style={{ padding: "11px 18px", borderBottom: "1px solid #1E293B", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: 5, background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)", color: "#38BDF8", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ◎
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748B" }}>
                  AI Security Analysis
                </div>
              </div>
              <div style={{ padding: "14px 18px" }}>
                <AIStyledMarkdown content={explanation.explanation} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

