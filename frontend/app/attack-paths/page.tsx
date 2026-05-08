import { Navbar } from "@/components/Navbar";
import { fetchAttackPaths, explainAttackPaths } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function AttackPathsPage() {
  let paths: any[] = [];
  let explanation: any = {};
  try { paths = await fetchAttackPaths(); } catch {}
  try { explanation = await explainAttackPaths(); } catch {}

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar />
      <div style={{ flex: 1, overflowY: "auto", background: "var(--bg-base)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

          {/* Page header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#334155",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}>
              Security
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              <div>
                <h1 style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#E2E8F0",
                  letterSpacing: "-0.02em",
                  marginBottom: 6,
                  lineHeight: 1.2,
                }}>
                  Attack Path Analysis
                </h1>
                <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                  RBAC privilege escalation and lateral movement risk
                </p>
              </div>
              {paths.length > 0 && (
                <div style={{
                  flexShrink: 0,
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.22)",
                  borderRadius: 0,
                  padding: "6px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                  <div style={{
                    width: 5, height: 5, borderRadius: 0,
                    background: "#EF4444",
                  }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#F87171" }}>
                    {paths.length} PATH{paths.length !== 1 ? "S" : ""} DETECTED
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Empty state */}
          {paths.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "64px 24px",
              background: "var(--bg-panel)",
              borderRadius: 0,
              border: "1px solid var(--border)",
            }}>
              <div style={{ fontSize: 36, color: "#10B981", marginBottom: 12 }}>✓</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#E2E8F0", marginBottom: 6 }}>
                No attack paths detected
              </div>
              <div style={{ fontSize: 13, color: "#4B5563" }}>
                All RBAC relationships appear to follow least-privilege
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {paths.map((path, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 0,
                    border: "1px solid rgba(239,68,68,0.22)",
                    background: "var(--bg-panel)",
                    overflow: "hidden",
                  }}
                >
                  {/* Path header */}
                  <div style={{
                    padding: "13px 18px",
                    borderBottom: "1px solid rgba(239,68,68,0.12)",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "rgba(239,68,68,0.04)",
                  }}>
                    <span style={{
                      padding: "3px 10px",
                      borderRadius: 0,
                      fontSize: 9,
                      fontWeight: 800,
                      letterSpacing: "0.07em",
                      background: "rgba(239,68,68,0.12)",
                      color: "#F87171",
                      textTransform: "uppercase",
                    }}>
                      Path {i + 1}
                    </span>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>
                      {path.type}
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, color: "#64748B" }}>Risk Score</span>
                      <span style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: "#EF4444",
                        letterSpacing: "-0.01em",
                      }}>
                        {path.risk_score}
                        <span style={{ fontSize: 10, fontWeight: 400, color: "#475569" }}>/100</span>
                      </span>
                    </div>
                  </div>

                  {/* Path body */}
                  <div style={{
                    padding: "18px 20px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 24,
                  }}>
                    {/* Escalation chain */}
                    <div>
                      <div style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: "#334155",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: 14,
                      }}>
                        Escalation Chain
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {path.path.map((step: string, si: number) => (
                          <div key={si}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 24,
                                height: 24,
                                borderRadius: 0,
                                flexShrink: 0,
                                background: si === 0 || si === path.path.length - 1
                                  ? "rgba(239,68,68,0.12)"
                                  : "var(--bg-panel)",
                                border: `1px solid ${si === 0 || si === path.path.length - 1 ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 9,
                                color: "#F87171",
                                fontWeight: 800,
                              }}>
                                {si + 1}
                              </div>
                              <div style={{
                                fontSize: 11,
                                color: "#CBD5E1",
                                fontFamily: "'JetBrains Mono', monospace",
                              }}>
                                {step}
                              </div>
                            </div>
                            {si < path.path.length - 1 && (
                              <div style={{
                                width: 1,
                                height: 12,
                                background: "var(--border)",
                                marginLeft: 11,
                              }} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Accessible secrets + entry point */}
                    <div>
                      <div style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: "#334155",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: 12,
                      }}>
                        Accessible Secrets
                      </div>
                      {path.accessible_secrets?.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
                          {path.accessible_secrets.map((s: string) => (
                            <div key={s} style={{
                              padding: "7px 12px",
                              borderRadius: 0,
                              background: "rgba(239,68,68,0.06)",
                              border: "1px solid rgba(239,68,68,0.18)",
                              fontSize: 11,
                              color: "#F87171",
                              fontFamily: "'JetBrains Mono', monospace",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}>
                              <span style={{ color: "#475569", fontSize: 10 }}>⊞</span>
                              {s}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: "#334155", marginBottom: 18 }}>
                          No secrets directly accessible
                        </div>
                      )}

                      <div style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: "#334155",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}>
                        Entry Point
                      </div>
                      <div style={{
                        padding: "8px 12px",
                        borderRadius: 0,
                        fontSize: 11,
                        background: "rgba(245,158,11,0.07)",
                        border: "1px solid rgba(245,158,11,0.2)",
                        color: "#FCD34D",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {path.entry}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Security Analysis */}
          {explanation?.explanation && (
            <div style={{
              marginTop: 24,
              padding: "20px 24px",
              borderRadius: 0,
              background: "var(--bg-panel)",
              border: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: 0,
                  background: "rgba(56,189,248,0.1)",
                  border: "1px solid rgba(56,189,248,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  color: "#38BDF8",
                }}>◎</div>
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#475569",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}>
                  AI Security Analysis
                </div>
              </div>
              <div style={{
                fontSize: 13,
                color: "#CBD5E1",
                lineHeight: 1.8,
                whiteSpace: "pre-wrap",
              }}>
                {explanation.explanation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
