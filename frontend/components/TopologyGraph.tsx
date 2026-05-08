"use client";
import { useCallback, useState } from "react";
import ReactFlow, {
  Background, Controls, MiniMap, useNodesState, useEdgesState,
  BackgroundVariant, MarkerType, type Node, type Edge, type NodeMouseHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import { KubeNode } from "./KubeNode";
import { simulateFailure, resetTopology, type TopologyData, type TopologyEdge, type TopologyNode } from "@/lib/api";

const nodeTypes = { kubeNode: KubeNode };

// Restrained edge color palette — single-hue variations
const EDGE_COLORS: Record<string, string> = {
  traffic:          "#38BDF8",
  depends:          "#64748B",
  database:         "#F59E0B",
  cache:            "#8B5CF6",
  auth:             "#6366F1",
  manages:          "#475569",
  rbac:             "#EF4444",
  "bound-to":       "#EF4444",
  accesses:         "#F97316",
  publishes:        "#10B981",
};

function buildRFNodes(nodes: TopologyNode[]): Node<TopologyNode>[] {
  return nodes.map((n, i) => ({
    id: n.id,
    type: "kubeNode",
    position: getPosition(n.type, i),
    data: n,
  }));
}

function getPosition(type: string, index: number) {
  const layers: Record<string, number> = {
    ingress: 0, service: 1, pod: 2, database: 3,
    cache: 3, "message-queue": 3,
    "service-account": 4, "cluster-role": 4, secret: 4,
  };
  const layer = layers[type] ?? 1;
  const y = layer * 160 + 40;
  const x = (index % 6) * 200 + 80;
  return { x, y };
}

function buildRFEdges(edges: TopologyEdge[]): Edge[] {
  return edges.map((e) => ({
    id: e.id || `${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    animated: e.type === "traffic" || e.type === "depends",
    style: {
      stroke: EDGE_COLORS[e.type] || "#2D3F5B",
      strokeWidth: 1.5,
      opacity: 0.55,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: EDGE_COLORS[e.type] || "#2D3F5B",
      width: 10,
      height: 10,
    },
    label: e.type,
    labelStyle: { fill: "#475569", fontSize: 8 },
    labelBgStyle: { fill: "#000000", fillOpacity: 0.92 },
  }));
}

interface TopologyGraphProps {
  initialTopology: TopologyData;
  onNodeClick?: (node: TopologyNode) => void;
}

const SCENARIOS = [
  { id: "auth-svc",      label: "Auth Crash" },
  { id: "redis",         label: "Redis Outage" },
  { id: "postgres",      label: "DB Failure" },
  { id: "payment-svc",   label: "Payment Spike" },
];

export function TopologyGraph({ initialTopology, onNodeClick }: TopologyGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(buildRFNodes(initialTopology.nodes));
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildRFEdges(initialTopology.edges));
  const [simulating, setSimulating] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState("auth-svc");

  async function handleSimulate() {
    setSimulating(true);
    try {
      const result = await simulateFailure(selectedScenario);
      const topo = result.topology;
      setNodes(buildRFNodes(topo.nodes));
      setEdges(buildRFEdges(topo.edges));
    } catch (e) {
      console.error(e);
    }
    setSimulating(false);
  }

  async function handleReset() {
    try {
      const topo = await resetTopology();
      setNodes(buildRFNodes(topo.nodes));
      setEdges(buildRFEdges(topo.edges));
    } catch (e) {
      console.error(e);
    }
  }

  const onNodeClickCb: NodeMouseHandler = useCallback((_, node) => {
    onNodeClick?.(node.data);
  }, [onNodeClick]);

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {/* Simulation control bar */}
      <div style={{
        position: "absolute",
        top: 12,
        left: 12,
        zIndex: 10,
        display: "flex",
        gap: 6,
        alignItems: "center",
        background: "var(--bg-panel)",
        border: "1px solid var(--border)",
        borderRadius: 0,
        padding: "7px 12px",
      }}>
        {/* Label */}
        <span style={{
          fontSize: 9,
          fontWeight: 700,
          color: "#4B5563",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginRight: 4,
        }}>
          Simulate
        </span>

        {/* Scenario selector buttons */}
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedScenario(s.id)}
            style={{
              padding: "4px 10px",
              borderRadius: 0,
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
              border: selectedScenario === s.id
                ? "1px solid rgba(239,68,68,0.35)"
                : "1px solid var(--border)",
              background: selectedScenario === s.id
                ? "rgba(239,68,68,0.1)"
                : "transparent",
              color: selectedScenario === s.id ? "#F87171" : "#64748B",
              fontFamily: "inherit",
            }}
          >
            {s.label}
          </button>
        ))}

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: "var(--border)", margin: "0 4px" }} />

        {/* Trigger button */}
        <button
          onClick={handleSimulate}
          disabled={simulating}
          style={{
            padding: "4px 12px",
            borderRadius: 0,
            fontSize: 11,
            fontWeight: 600,
            cursor: simulating ? "not-allowed" : "pointer",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#F87171",
            opacity: simulating ? 0.5 : 1,
            transition: "opacity 0.15s",
            fontFamily: "inherit",
          }}
        >
          {simulating ? "Simulating…" : "Trigger Failure"}
        </button>

        {/* Reset button */}
        <button
          onClick={handleReset}
          style={{
            padding: "4px 10px",
            borderRadius: 0,
            fontSize: 11,
            fontWeight: 500,
            cursor: "pointer",
            background: "transparent",
            border: "1px solid var(--border)",
            color: "#64748B",
            transition: "all 0.15s",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#10B981";
            e.currentTarget.style.borderColor = "rgba(16,185,129,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#64748B";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          ↺ Reset
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClickCb}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#333333"
          gap={28}
          size={1}
        />
        <Controls style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 0 }} />
        <MiniMap
          style={{ background: "var(--bg-base)", border: "1px solid var(--border)", borderRadius: 0 }}
          nodeColor={(n) => {
            const s = n.data?.status;
            return s === "critical" ? "#EF4444" : s === "warning" ? "#F59E0B" : "#10B981";
          }}
          maskColor="rgba(0,0,0,0.65)"
        />
      </ReactFlow>
    </div>
  );
}
