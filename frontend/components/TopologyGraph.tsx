"use client";
import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Background, Controls, MiniMap, useNodesState, useEdgesState,
  addEdge, BackgroundVariant, MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";
import { KubeNode } from "./KubeNode";
import { simulateFailure, resetTopology } from "@/lib/api";

const nodeTypes = { kubeNode: KubeNode };

const EDGE_COLORS: Record<string, string> = {
  traffic: "#06b6d4",
  depends: "#3b82f6",
  database: "#f59e0b",
  cache: "#ec4899",
  auth: "#8b5cf6",
  manages: "#6b7280",
  rbac: "#ef4444",
  "bound-to": "#ef4444",
  accesses: "#f97316",
  publishes: "#10b981",
};

function buildRFNodes(nodes: any[]) {
  return nodes.map((n, i) => ({
    id: n.id,
    type: "kubeNode",
    position: getPosition(n.type, i, nodes.length),
    data: n,
  }));
}

function getPosition(type: string, index: number, total: number) {
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

function buildRFEdges(edges: any[]) {
  return edges.map((e) => ({
    id: e.id || `${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    animated: e.type === "traffic" || e.type === "depends",
    style: { stroke: EDGE_COLORS[e.type] || "#1e2d45", strokeWidth: 1.5, opacity: 0.7 },
    markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLORS[e.type] || "#1e2d45", width: 12, height: 12 },
    label: e.type,
    labelStyle: { fill: "#4a5568", fontSize: 9 },
    labelBgStyle: { fill: "#080c14", fillOpacity: 0.8 },
  }));
}

interface TopologyGraphProps {
  initialTopology: { nodes: any[]; edges: any[] };
  onNodeClick?: (node: any) => void;
}

export function TopologyGraph({ initialTopology, onNodeClick }: TopologyGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(buildRFNodes(initialTopology.nodes));
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildRFEdges(initialTopology.edges));
  const [simulating, setSimulating] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState("auth-svc");

  const SCENARIOS = [
    { id: "auth-svc", label: "Auth Crash" },
    { id: "redis", label: "Redis Outage" },
    { id: "postgres", label: "DB Failure" },
    { id: "payment-svc", label: "Payment Spike" },
  ];

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

  const onNodeClickCb = useCallback((_: any, node: any) => {
    onNodeClick?.(node.data);
  }, [onNodeClick]);

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {/* Control Bar */}
      <div style={{
        position: "absolute", top: 12, left: 12, zIndex: 10,
        display: "flex", gap: 8, alignItems: "center",
        background: "rgba(8,12,20,0.9)", border: "1px solid #1e2d45",
        borderRadius: 8, padding: "8px 12px", backdropFilter: "blur(8px)",
      }}>
        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>SIMULATE:</span>
        {SCENARIOS.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedScenario(s.id)}
            style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
              border: selectedScenario === s.id ? "1px solid #ef4444" : "1px solid #1e2d45",
              background: selectedScenario === s.id ? "rgba(239,68,68,0.15)" : "rgba(17,24,39,0.8)",
              color: selectedScenario === s.id ? "#f87171" : "#94a3b8",
              transition: "all 0.2s",
            }}
          >{s.label}</button>
        ))}
        <button
          onClick={handleSimulate}
          disabled={simulating}
          style={{
            padding: "4px 14px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer",
            background: "rgba(239,68,68,0.2)", border: "1px solid #ef4444", color: "#f87171",
            opacity: simulating ? 0.6 : 1,
          }}
        >⚡ {simulating ? "Simulating..." : "Trigger Failure"}</button>
        <button
          onClick={handleReset}
          style={{
            padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
            background: "rgba(16,185,129,0.1)", border: "1px solid #10b981", color: "#6ee7b7",
          }}
        >↺ Reset</button>
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
        <Background variant={BackgroundVariant.Dots} color="#1e2d45" gap={24} size={1} />
        <Controls style={{ background: "#111827", border: "1px solid #1e2d45" }} />
        <MiniMap
          style={{ background: "#0d1420", border: "1px solid #1e2d45" }}
          nodeColor={(n) => {
            const s = n.data?.status;
            return s === "critical" ? "#ef4444" : s === "warning" ? "#f59e0b" : "#10b981";
          }}
          maskColor="rgba(8,12,20,0.8)"
        />
      </ReactFlow>
    </div>
  );
}
