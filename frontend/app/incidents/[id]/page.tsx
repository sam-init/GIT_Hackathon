import { Navbar } from "@/components/Navbar";
import { RCAPanel } from "@/components/RCAPanel";
import { IncidentTimeline } from "@/components/IncidentTimeline";
import { fetchIncident } from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

const SEV_COLOR: Record<string, string> = {
  critical: "#ef4444", high: "#f59e0b", medium: "#fde68a", low: "#10b981",
};

export default async function IncidentDetailPage({ params }: { params: { id: string } }) {
  let incident: any = null;
  try { incident = await fetchIncident(params.id); } catch {}

  if (!incident) return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh" }}>
      <Navbar />
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:"#4a5568" }}>
        Incident not found
      </div>
    </div>
  );

  const color = SEV_COLOR[incident.severity] || "#6b7280";

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh" }}>
      <Navbar />
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* Left: RCA + blast radius */}
        <div style={{ flex:1, overflowY:"auto", padding:"28px 32px" }}>
          {/* Header */}
          <div style={{ marginBottom:24 }}>
            <Link href="/incidents" style={{ fontSize:11, color:"#4a5568", textDecoration:"none" }}>
              ← Back to incidents
            </Link>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:12, flexWrap:"wrap" }}>
              <span className={`badge badge-${incident.severity}`}>{incident.severity}</span>
              <span className={`badge badge-${incident.status}`}>{incident.status}</span>
              {incident.attack_path && (
                <span style={{ padding:"2px 10px", borderRadius:999, fontSize:11, fontWeight:700,
                  background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.4)", color:"#f87171" }}>
                  🔑 ATTACK PATH
                </span>
              )}
            </div>
            <h1 style={{ fontSize:22, fontWeight:800, color:"#e2e8f0", marginTop:10, lineHeight:1.3 }}>
              {incident.title}
            </h1>
            <div style={{ fontSize:12, color:"#94a3b8", marginTop:6 }}>
              {incident.service} · {incident.namespace} · Started {incident.started_at?.slice(0,16).replace("T"," ")} UTC
            </div>
          </div>

          {/* Blast radius */}
          {incident.blast_radius?.length > 0 && (
            <div style={{
              padding:"16px 20px", borderRadius:10, marginBottom:24,
              background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.2)",
            }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#ef4444", letterSpacing:"0.1em", marginBottom:10 }}>
                💥 BLAST RADIUS — {incident.blast_radius.length} SERVICES AFFECTED
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {incident.blast_radius.map((s: string) => (
                  <span key={s} style={{
                    padding:"4px 12px", borderRadius:6, fontSize:11, fontWeight:500,
                    background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:"#f87171",
                  }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Attack path */}
          {incident.attack_path_detail && (
            <div style={{
              padding:"16px 20px", borderRadius:10, marginBottom:24,
              background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.3)",
            }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#ef4444", letterSpacing:"0.1em", marginBottom:12 }}>
                🔑 ATTACK PATH — RISK: {incident.attack_path_detail.risk_score}/100
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {incident.attack_path_detail.path.map((step: string, i: number) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:"#ef4444", flexShrink:0 }} />
                    <span style={{ fontSize:12, color:"#e2e8f0", fontFamily:"JetBrains Mono, monospace" }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RCA */}
          {incident.rca ? (
            <div style={{ borderRadius:12, border:"1px solid #1e2d45", background:"rgba(17,24,39,0.8)", overflow:"hidden" }}>
              <div style={{ padding:"14px 20px", borderBottom:"1px solid #1e2d45", fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:"0.1em" }}>
                AI ROOT CAUSE ANALYSIS
              </div>
              <RCAPanel rca={incident.rca} severity={incident.severity} />
            </div>
          ) : (
            <div style={{
              padding:"32px", borderRadius:12, border:"1px dashed #1e2d45",
              textAlign:"center", color:"#4a5568",
            }}>
              <div style={{ fontSize:24, marginBottom:8 }}>🔍</div>
              <div style={{ fontSize:13 }}>No RCA generated yet</div>
              <form action={`http://localhost:8000/incidents/${params.id}/analyze`} method="POST" style={{ marginTop:16 }}>
                <button style={{
                  padding:"8px 20px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer",
                  background:"rgba(6,182,212,0.15)", border:"1px solid rgba(6,182,212,0.3)", color:"#06b6d4",
                }}>⚡ Generate AI RCA</button>
              </form>
            </div>
          )}
        </div>

        {/* Right: Timeline */}
        <div style={{ width:340, borderLeft:"1px solid #1e2d45", overflowY:"auto" }}>
          <div style={{ padding:"20px 20px 12px", borderBottom:"1px solid #1e2d45" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:"0.1em" }}>
              INCIDENT TIMELINE
            </div>
          </div>
          <IncidentTimeline events={incident.timeline || []} />

          {/* Telemetry */}
          {incident.telemetry && (
            <div style={{ padding:"16px 20px", borderTop:"1px solid #1e2d45" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", letterSpacing:"0.1em", marginBottom:10 }}>
                RAW TELEMETRY
              </div>
              <pre style={{
                fontSize:10, color:"#06b6d4", fontFamily:"JetBrains Mono, monospace",
                background:"rgba(6,182,212,0.05)", border:"1px solid #1e2d45",
                borderRadius:8, padding:12, overflowX:"auto", lineHeight:1.6,
                whiteSpace:"pre-wrap", wordBreak:"break-word",
              }}>
                {JSON.stringify(incident.telemetry, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
