import { Navbar } from "@/components/Navbar";
import { IncidentPanel } from "@/components/IncidentPanel";
import { fetchIncidents } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function IncidentsPage() {
  let incidents: any[] = [];
  try { incidents = await fetchIncidents(); } catch {}

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ width: 360, borderRight: "1px solid #1e2d45", overflowY: "auto" }}>
          <IncidentPanel incidents={incidents} />
        </div>
        <div style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#e2e8f0", marginBottom: 4 }}>
            Incident Dashboard
          </h1>
          <p style={{ color: "#4a5568", fontSize: 13, marginBottom: 28 }}>
            {incidents.length} total incidents · {incidents.filter(i=>i.status==="active").length} active
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32 }}>
            {[
              { label: "Active", value: incidents.filter(i=>i.status==="active").length, color: "#ef4444" },
              { label: "Investigating", value: incidents.filter(i=>i.status==="investigating").length, color: "#f59e0b" },
              { label: "Resolved", value: incidents.filter(i=>i.status==="resolved").length, color: "#10b981" },
            ].map(s => (
              <div key={s.label} style={{
                padding: "20px 24px", borderRadius: 12, background: "rgba(17,24,39,0.8)",
                border: `1px solid ${s.color}33`,
              }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, color: "#4a5568", letterSpacing: "0.1em", marginBottom: 12 }}>
            ALL INCIDENTS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {incidents.map(inc => (
              <a key={inc.id} href={`/incidents/${inc.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  padding: "16px 20px", borderRadius: 10, background: "rgba(17,24,39,0.8)",
                  border: "1px solid #1e2d45", display: "flex", alignItems: "center", gap: 16,
                  transition: "all 0.2s", cursor: "pointer",
                }}
                  onMouseEnter={e=>(e.currentTarget.style.borderColor="#2d4060")}
                  onMouseLeave={e=>(e.currentTarget.style.borderColor="#1e2d45")}
                >
                  <span className={`badge badge-${inc.severity}`}>{inc.severity}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{inc.title}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{inc.service} · {inc.namespace}</div>
                  </div>
                  <span className={`badge badge-${inc.status}`}>{inc.status}</span>
                  <span style={{ fontSize: 11, color: "#4a5568" }}>{inc.started_at?.slice(11,16)} UTC</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
