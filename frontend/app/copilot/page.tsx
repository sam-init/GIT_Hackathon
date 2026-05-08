import { Navbar } from "@/components/Navbar";
import { AICopilot } from "@/components/AICopilot";

export default function CopilotPage() {
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh" }}>
      <Navbar />
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* Left info panel */}
        <div style={{
          width:280, borderRight:"1px solid #1e2d45", padding:"28px 20px",
          background:"rgba(8,12,20,0.6)", overflowY:"auto",
        }}>
          <div style={{ marginBottom:28 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:"0.1em", marginBottom:16 }}>
              COPILOT CAPABILITIES
            </div>
            {[
              { icon:"⬡", title:"Topology Awareness", desc:"Understands service dependencies and relationships" },
              { icon:"💥", title:"Blast Radius Analysis", desc:"Identifies downstream impact of failures" },
              { icon:"🔑", title:"Attack Path Reasoning", desc:"Explains RBAC escalation and lateral movement" },
              { icon:"📋", title:"RCA Generation", desc:"Root cause analysis with evidence and confidence" },
              { icon:"🔧", title:"Remediation Steps", desc:"kubectl commands and fix recommendations" },
            ].map(c => (
              <div key={c.title} style={{ marginBottom:14, padding:"12px", borderRadius:8,
                background:"rgba(17,24,39,0.6)", border:"1px solid #1e2d45" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:16 }}>{c.icon}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:"#e2e8f0" }}>{c.title}</span>
                </div>
                <div style={{ fontSize:11, color:"#4a5568", lineHeight:1.5 }}>{c.desc}</div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:"0.1em", marginBottom:12 }}>
              SUGGESTED QUERIES
            </div>
            {[
              "Why is auth-service crashing?",
              "What's the blast radius of postgres failure?",
              "Explain the RBAC attack path",
              "How do I fix the Redis OOMKilled issue?",
              "What changed before the last incident?",
              "Show me high-risk services",
            ].map(q => (
              <div key={q} style={{
                padding:"8px 12px", borderRadius:6, marginBottom:6, fontSize:11,
                background:"rgba(6,182,212,0.05)", border:"1px solid rgba(6,182,212,0.15)",
                color:"#06b6d4", cursor:"pointer", lineHeight:1.4,
              }}>
                {q}
              </div>
            ))}
          </div>
        </div>

        {/* Main chat */}
        <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"16px 24px", borderBottom:"1px solid #1e2d45",
            background:"rgba(8,12,20,0.6)", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{
              width:36, height:36, borderRadius:10,
              background:"linear-gradient(135deg,#06b6d4,#8b5cf6)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:18, boxShadow:"0 0 16px rgba(6,182,212,0.4)",
            }}>🤖</div>
            <div>
              <div style={{ fontSize:15, fontWeight:800, color:"#e2e8f0" }}>KubeGraph Sentinel Copilot</div>
              <div style={{ fontSize:11, color:"#06b6d4" }}>
                Infrastructure-aware · Graph-native · NVIDIA Powered
              </div>
            </div>
            <div style={{ marginLeft:"auto", display:"flex", gap:16 }}>
              {[
                { label:"CONTEXT", value:"Full cluster" },
                { label:"MODEL", value:"Llama 3.1 70B" },
                { label:"MODE", value:"SRE Expert" },
              ].map(m => (
                <div key={m.label} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:9, color:"#4a5568", letterSpacing:"0.1em" }}>{m.label}</div>
                  <div style={{ fontSize:11, fontWeight:600, color:"#94a3b8" }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex:1, overflow:"hidden" }}>
            <AICopilot />
          </div>
        </div>
      </div>
    </div>
  );
}
