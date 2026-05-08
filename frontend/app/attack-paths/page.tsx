import { Navbar } from "@/components/Navbar";
import { fetchAttackPaths, explainAttackPaths } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function AttackPathsPage() {
  let paths: any[] = [];
  let explanation: any = {};
  try { paths = await fetchAttackPaths(); } catch {}
  try { explanation = await explainAttackPaths(); } catch {}

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh" }}>
      <Navbar />
      <div style={{ flex:1, overflowY:"auto" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px" }}>
          {/* Header */}
          <div style={{ marginBottom:32 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
              <div style={{
                width:40, height:40, borderRadius:10,
                background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
              }}>🔑</div>
              <div>
                <h1 style={{ fontSize:22, fontWeight:800, color:"#e2e8f0" }}>Attack Path Analysis</h1>
                <p style={{ fontSize:12, color:"#94a3b8" }}>RBAC privilege escalation and lateral movement risk</p>
              </div>
              {paths.length > 0 && (
                <div style={{ marginLeft:"auto",
                  background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)",
                  borderRadius:999, padding:"4px 14px",
                }}>
                  <span style={{ fontSize:12, fontWeight:700, color:"#f87171" }}>
                    ⚠ {paths.length} PATH{paths.length!==1?"S":""} DETECTED
                  </span>
                </div>
              )}
            </div>
          </div>

          {paths.length === 0 ? (
            <div style={{ textAlign:"center", padding:"64px", color:"#10b981" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>✓</div>
              <div style={{ fontSize:16, fontWeight:600 }}>No attack paths detected</div>
              <div style={{ fontSize:13, color:"#4a5568", marginTop:8 }}>All RBAC relationships appear to follow least-privilege</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              {paths.map((path, i) => (
                <div key={i} style={{
                  borderRadius:12, border:"1px solid rgba(239,68,68,0.3)",
                  background:"rgba(239,68,68,0.05)", overflow:"hidden",
                }}>
                  {/* Path header */}
                  <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(239,68,68,0.15)",
                    display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{
                      padding:"4px 12px", borderRadius:6, fontSize:11, fontWeight:700,
                      background:"rgba(239,68,68,0.2)", color:"#f87171",
                    }}>ATTACK PATH {i+1}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#e2e8f0" }}>{path.type}</div>
                    <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:11, color:"#94a3b8" }}>Risk Score:</span>
                      <span style={{ fontSize:16, fontWeight:800, color:"#ef4444" }}>{path.risk_score}/100</span>
                    </div>
                  </div>

                  <div style={{ padding:"20px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
                    {/* Path chain */}
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", letterSpacing:"0.1em", marginBottom:14 }}>
                        ESCALATION CHAIN
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                        {path.path.map((step: string, si: number) => (
                          <div key={si}>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                              <div style={{
                                width:28, height:28, borderRadius:"50%", flexShrink:0,
                                background:si===0?"rgba(239,68,68,0.2)":si===path.path.length-1?"rgba(239,68,68,0.3)":"rgba(17,24,39,0.8)",
                                border:`1px solid ${si===0||si===path.path.length-1?"#ef4444":"#1e2d45"}`,
                                display:"flex", alignItems:"center", justifyContent:"center",
                                fontSize:11, color:"#ef4444", fontWeight:700,
                              }}>{si+1}</div>
                              <div style={{ fontSize:12, color:"#e2e8f0", fontFamily:"JetBrains Mono,monospace" }}>{step}</div>
                            </div>
                            {si < path.path.length-1 && (
                              <div style={{ width:1, height:16, background:"#1e2d45", marginLeft:14 }} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Accessible secrets */}
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", letterSpacing:"0.1em", marginBottom:14 }}>
                        ACCESSIBLE SECRETS
                      </div>
                      {path.accessible_secrets?.length > 0 ? (
                        path.accessible_secrets.map((s: string) => (
                          <div key={s} style={{
                            padding:"8px 12px", borderRadius:8, marginBottom:8,
                            background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)",
                            fontSize:12, color:"#f87171", fontFamily:"JetBrains Mono,monospace",
                            display:"flex", alignItems:"center", gap:8,
                          }}>
                            🔒 {s}
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize:12, color:"#4a5568" }}>No secrets directly accessible</div>
                      )}

                      {/* Entry point */}
                      <div style={{ marginTop:16 }}>
                        <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", letterSpacing:"0.1em", marginBottom:8 }}>
                          ENTRY POINT
                        </div>
                        <div style={{
                          padding:"8px 12px", borderRadius:8, fontSize:12,
                          background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)",
                          color:"#fbbf24", fontFamily:"JetBrains Mono,monospace",
                        }}>
                          ⚡ {path.entry}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Explanation */}
          {explanation?.explanation && (
            <div style={{
              marginTop:32, padding:"24px", borderRadius:12,
              background:"rgba(6,182,212,0.05)", border:"1px solid rgba(6,182,212,0.2)",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <span style={{ fontSize:18 }}>🤖</span>
                <div style={{ fontSize:12, fontWeight:700, color:"#06b6d4", letterSpacing:"0.08em" }}>
                  AI SECURITY ANALYSIS
                </div>
              </div>
              <div style={{ fontSize:13, color:"#e2e8f0", lineHeight:1.8, whiteSpace:"pre-wrap" }}>
                {explanation.explanation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
