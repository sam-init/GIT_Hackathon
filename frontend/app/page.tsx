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

  const activeCount = incidents.filter(i => i.status === "active").length;
  const criticalCount = incidents.filter(i => i.severity === "critical").length;
  const healthyNodes = topology.nodes?.filter((n: any) => n.status === "healthy").length ?? 0;
  const totalNodes = topology.nodes?.length ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Navbar />

      {/* Stats bar */}
      <div style={{
        display: "flex", gap: 0, borderBottom: "1px solid #1e2d45",
        background: "rgba(8,12,20,0.9)",
      }}>
        {[
          { label: "TOTAL NODES", value: totalNodes, color: "#06b6d4" },
          { label: "HEALTHY", value: healthyNodes, color: "#10b981" },
          { label: "ACTIVE INCIDENTS", value: activeCount, color: activeCount > 0 ? "#ef4444" : "#10b981" },
          { label: "CRITICAL", value: criticalCount, color: criticalCount > 0 ? "#ef4444" : "#10b981" },
          { label: "EDGES", value: topology.edges?.length ?? 0, color: "#8b5cf6" },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, padding: "10px 20px",
            borderRight: "1px solid #1e2d45",
            display: "flex", flexDirection: "column", gap: 2,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#4a5568", letterSpacing: "0.12em" }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Main layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: Topology graph */}
        <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
          <TopologyGraph initialTopology={topology} />
        </div>

        {/* Right column */}
        <div style={{
          width: 320, borderLeft: "1px solid #1e2d45",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Incidents - top 50% */}
          <div style={{ flex: 1, borderBottom: "1px solid #1e2d45", overflowY: "auto" }}>
            <IncidentPanel incidents={incidents} />
          </div>
          {/* Copilot - bottom 50% */}
          <div style={{ flex: 1, overflowY: "hidden", display: "flex", flexDirection: "column" }}>
            <AICopilot />
          </div>
        </div>
      </div>
    </div>
  );
}
