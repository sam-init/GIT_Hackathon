import { Navbar } from "@/components/Navbar";
import { RCAPanel } from "@/components/RCAPanel";
import { RCAExportButton } from "@/components/RCAExportButton";
import { IncidentTimeline } from "@/components/IncidentTimeline";
import { fetchIncident, API } from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

const SEV_COLOR: Record<string, string> = {
  critical: "#EF4444", high: "#F59E0B", medium: "#FBBF24", low: "#10B981",
};

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let incident: any = null;
  try { incident = await fetchIncident(id); } catch {}

  if (!incident) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar />
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 8,
        color: "#4B5563",
      }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>◌</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#64748B" }}>Incident not found</div>
        <Link href="/incidents" style={{
          marginTop: 12, fontSize: 12, color: "#38BDF8", textDecoration: "none",
        }}>
          ← Back to incidents
        </Link>
      </div>
    </div>
  );

  const color = SEV_COLOR[incident.severity] || "#6B7280";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Left column: RCA + details */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", background: "var(--bg-base)" }}>

          {/* Breadcrumb */}
          <Link href="/incidents" style={{
            fontSize: 11,
            color: "#475569",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            marginBottom: 18,
            transition: "color 0.15s",
          }}>
            ← Incidents
          </Link>

          {/* Incident header */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <span className={`badge badge-${incident.severity}`}>{incident.severity}</span>
              <span className={`badge badge-${incident.status}`}>{incident.status}</span>
              {incident.attack_path && (
                <span style={{
                  padding: "2px 8px",
                  borderRadius: 0,
                  fontSize: 10,
                  fontWeight: 700,
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#F87171",
                  letterSpacing: "0.04em",
                }}>
                  ATTACK PATH
                </span>
              )}
            </div>

            <h1 style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#E2E8F0",
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
              marginBottom: 8,
            }}>
              {incident.title}
            </h1>

            <div style={{
              fontSize: 12,
              color: "#64748B",
              display: "flex",
              gap: 6,
              alignItems: "center",
              flexWrap: "wrap",
            }}>
              <span style={{ color: "#38BDF8" }}>{incident.service}</span>
              <span>·</span>
              <span>{incident.namespace}</span>
              <span>·</span>
              <span>
                {incident.started_at?.slice(0, 16).replace("T", " ")} UTC
              </span>
            </div>
          </div>

          {/* Blast radius */}
          {incident.blast_radius?.length > 0 && (
            <div style={{
              padding: "14px 18px",
              borderRadius: 0,
              marginBottom: 20,
              background: "rgba(239,68,68,0.05)",
              border: "1px solid rgba(239,68,68,0.18)",
            }}>
              <div style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#EF4444",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}>
                Blast Radius — {incident.blast_radius.length} services affected
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {incident.blast_radius.map((s: string) => (
                  <span key={s} style={{
                    padding: "3px 9px",
                    borderRadius: 0,
                    fontSize: 11,
                    fontWeight: 500,
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "#F87171",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attack path */}
          {incident.attack_path_detail && (
            <div style={{
              padding: "14px 18px",
              borderRadius: 0,
              marginBottom: 20,
              background: "rgba(239,68,68,0.05)",
              border: "1px solid rgba(239,68,68,0.22)",
            }}>
              <div style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#EF4444",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}>
                Attack Path — Risk Score: {incident.attack_path_detail.risk_score}/100
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {incident.attack_path_detail.path.map((step: string, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: 0,
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.22)",
                      color: "#F87171",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <span style={{
                      fontSize: 11,
                      color: "#E2E8F0",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RCA panel */}
          {incident.rca ? (
            <div style={{
              borderRadius: 0,
              border: "1px solid var(--border)",
              background: "var(--bg-panel)",
              overflow: "hidden",
            }}>
              {/* RCA header */}
              <div style={{
                padding: "12px 20px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#475569",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}>
                  AI Root Cause Analysis
                </div>
                <RCAExportButton incident={incident} rca={incident.rca} />
              </div>
              <RCAPanel rca={incident.rca} severity={incident.severity} />
            </div>
          ) : (
            <div style={{
              padding: "36px",
              borderRadius: 0,
              border: "1px dashed var(--border)",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 28, color: "#334155", marginBottom: 10 }}>◌</div>
              <div style={{ fontSize: 13, color: "#4B5563", marginBottom: 16 }}>
                No RCA generated yet
              </div>
              <form action={`${API}/incidents/${id}/analyze`} method="POST">
                <button style={{
                  padding: "8px 20px",
                  borderRadius: 0,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: "rgba(56,189,248,0.1)",
                  border: "1px solid rgba(56,189,248,0.25)",
                  color: "#38BDF8",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}>
                  Generate AI RCA
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right column: Timeline */}
        <div style={{
          width: 320,
          borderLeft: "1px solid var(--border)",
          overflowY: "auto",
          background: "var(--bg-secondary)",
          flexShrink: 0,
        }}>
          {/* Timeline header */}
          <div style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: 0,
            background: "var(--bg-secondary)",
            zIndex: 1,
          }}>
            <div style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#334155",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>
              Incident Timeline
            </div>
          </div>

          <IncidentTimeline events={incident.timeline || []} />

          {/* Telemetry */}
          {incident.telemetry && (
            <div style={{
              padding: "14px 20px",
              borderTop: "1px solid var(--border)",
            }}>
              <div style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#334155",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}>
                Raw Telemetry
              </div>
              <pre style={{
                fontSize: 10,
                color: "#64748B",
                fontFamily: "'JetBrains Mono', monospace",
                background: "var(--bg-base)",
                border: "1px solid var(--border)",
                borderRadius: 0,
                padding: 12,
                overflowX: "auto",
                lineHeight: 1.65,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
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
