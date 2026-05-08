import { Navbar } from "@/components/Navbar";
import { TopologyGraph } from "@/components/TopologyGraph";
import { IncidentPanel } from "@/components/IncidentPanel";
import { AICopilot } from "@/components/AICopilot";
import { fetchTopology, fetchIncidents } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let topology = { nodes: [], edges: [] };
  let incidents: any[] = [];

  try { topology = await fetchTopology(); } catch {}
  try { incidents = await fetchIncidents(); } catch {}

  const activeCount   = incidents.filter((i) => i.status === "active").length;
  const criticalCount = incidents.filter((i) => i.severity === "critical").length;
  const healthyNodes  = topology.nodes?.filter((n: any) => n.status === "healthy").length ?? 0;
  const totalNodes    = topology.nodes?.length ?? 0;

  const stats = [
    { label: "Nodes",            value: totalNodes,    color: "#38BDF8",  neutral: true },
    { label: "Healthy",          value: healthyNodes,  color: "#10B981",  neutral: false },
    { label: "Active Incidents", value: activeCount,   color: activeCount   > 0 ? "#EF4444" : "#10B981", neutral: false },
    { label: "Critical",         value: criticalCount, color: criticalCount > 0 ? "#EF4444" : "#10B981", neutral: false },
    { label: "Connections",      value: topology.edges?.length ?? 0, color: "#64748B", neutral: true },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Navbar />

      {/* Stats bar */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-secondary)",
        flexShrink: 0,
      }}>
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              padding: "10px 18px",
              borderRight: i < stats.length - 1 ? "1px solid var(--border)" : "none",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <div style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#334155",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>
              {s.label}
            </div>
            <div style={{
              fontSize: 20,
              fontWeight: 800,
              color: s.color,
              lineHeight: 1,
              letterSpacing: "-0.01em",
            }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Topology canvas */}
        <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
          <TopologyGraph initialTopology={topology} />
        </div>

        {/* Right sidebar */}
        <div style={{
          width: 316,
          borderLeft: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "var(--bg-secondary)",
        }}>
          {/* Incidents — top 50% */}
          <div style={{
            flex: 1,
            borderBottom: "1px solid var(--border)",
            overflowY: "auto",
            minHeight: 0,
          }}>
            <IncidentPanel incidents={incidents} />
          </div>
          {/* Copilot — bottom 50% */}
          <div style={{
            flex: 1,
            overflowY: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}>
            <AICopilot />
          </div>
        </div>
      </div>
    </div>
  );
}
