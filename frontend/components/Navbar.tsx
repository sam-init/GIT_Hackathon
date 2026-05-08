"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Topology", icon: "⬡" },
  { href: "/incidents", label: "Incidents", icon: "🚨" },
  { href: "/attack-paths", label: "Attack Paths", icon: "🔑" },
  { href: "/copilot", label: "AI Copilot", icon: "🤖" },
];

export function Navbar() {
  const path = usePathname();
  return (
    <nav style={{
      height: 56, background: "rgba(8,12,20,0.95)", borderBottom: "1px solid #1e2d45",
      display: "flex", alignItems: "center", padding: "0 24px",
      backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 40 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, boxShadow: "0 0 16px rgba(6,182,212,0.4)",
        }}>⬡</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#e2e8f0", letterSpacing: "-0.02em" }}>
            KubeGraph <span style={{ color: "#06b6d4" }}>Sentinel</span>
          </div>
          <div style={{ fontSize: 9, color: "#4a5568", letterSpacing: "0.1em" }}>AI INCIDENT INTELLIGENCE</div>
        </div>
      </div>

      {/* Links */}
      <div style={{ display: "flex", gap: 4 }}>
        {NAV.map(n => {
          const active = path === n.href;
          return (
            <Link key={n.href} href={n.href} style={{ textDecoration: "none" }}>
              <div style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
                background: active ? "rgba(6,182,212,0.12)" : "transparent",
                border: active ? "1px solid rgba(6,182,212,0.3)" : "1px solid transparent",
                color: active ? "#06b6d4" : "#94a3b8",
              }}>
                <span>{n.icon}</span>
                <span>{n.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Status */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <div className="status-dot healthy" />
        <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>CLUSTER LIVE</span>
        <span style={{ fontSize: 10, color: "#4a5568", marginLeft: 8 }}>minikube · default</span>
      </div>
    </nav>
  );
}
