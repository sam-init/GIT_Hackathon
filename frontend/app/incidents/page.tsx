import { Navbar } from "@/components/Navbar";
import { IncidentPanel } from "@/components/IncidentPanel";
import { IncidentTable } from "@/components/IncidentTable";
import { fetchIncidents } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function IncidentsPage() {
  let incidents: any[] = [];
  try { incidents = await fetchIncidents(); } catch {}

  const activeCount       = incidents.filter((i) => i.status === "active").length;
  const investigatingCount= incidents.filter((i) => i.status === "investigating").length;
  const resolvedCount     = incidents.filter((i) => i.status === "resolved").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{
          width: 340,
          borderRight: "1px solid #1E293B",
          overflowY: "auto",
          background: "#0F172A",
          flexShrink: 0,
        }}>
          <IncidentPanel incidents={incidents} />
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto", background: "#0B1020" }}>

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
              Incidents
            </div>
            <h1 style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#E2E8F0",
              letterSpacing: "-0.02em",
              marginBottom: 4,
              lineHeight: 1.2,
            }}>
              Incident Dashboard
            </h1>
            <p style={{ color: "#475569", fontSize: 13 }}>
              {incidents.length} total · {activeCount} active
            </p>
          </div>

          {/* Stat cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: 32,
          }}>
            {[
              { label: "Active",        value: activeCount,        color: "#EF4444", bg: "rgba(239,68,68,0.07)",   border: "rgba(239,68,68,0.18)" },
              { label: "Investigating", value: investigatingCount,  color: "#F59E0B", bg: "rgba(245,158,11,0.07)",  border: "rgba(245,158,11,0.18)" },
              { label: "Resolved",      value: resolvedCount,       color: "#10B981", bg: "rgba(16,185,129,0.07)",  border: "rgba(16,185,129,0.18)" },
            ].map((s) => (
              <div key={s.label} style={{
                padding: "18px 20px",
                borderRadius: 8,
                background: s.bg,
                border: `1px solid ${s.border}`,
              }}>
                <div style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: s.color,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  marginBottom: 6,
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Table section */}
          <div style={{
            fontSize: 9,
            fontWeight: 700,
            color: "#334155",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}>
            All Incidents
          </div>

          <IncidentTable incidents={incidents} />
        </div>
      </div>
    </div>
  );
}
