"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/landing",      label: "Home",         icon: "◇" },
  { href: "/",             label: "Topology",     icon: "⬡" },
  { href: "/incidents",    label: "Incidents",    icon: "●" },
  { href: "/attack-paths", label: "Attack Paths", icon: "◈" },
  { href: "/copilot",      label: "AI Copilot",   icon: "◎" },
  { href: "/cypherai",     label: "CypherAI",     icon: "⟡" },
];

export function Navbar() {
  const path = usePathname();

  return (
    <nav style={{
      height: "var(--nav-height, 52px)",
      background: "var(--bg-base)",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      position: "sticky",
      top: 0,
      zIndex: 100,
      gap: 0,
    }}>
      {/* Logo mark */}
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, marginRight: 32 }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 0,
          background: "var(--accent, #38BDF8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          color: "#0F172A",
          fontWeight: 800,
          flexShrink: 0,
        }}>⬡</div>
        <div>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--text-primary, #E2E8F0)",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
          }}>
            KubeGraph <span style={{ color: "var(--accent, #38BDF8)", fontWeight: 700 }}>Sentinel</span>
          </div>
          <div style={{
            fontSize: 9,
            fontWeight: 600,
            color: "var(--text-muted, #4B5563)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            lineHeight: 1,
          }}>AI Incident Intelligence</div>
        </div>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
        {NAV.map((n) => {
          const active = path === n.href || (n.href !== "/" && path.startsWith(n.href));
          return (
            <Link key={n.href} href={n.href} style={{ textDecoration: "none" }}>
              <div style={{
                padding: "5px 12px",
                borderRadius: 0,
                fontSize: 12,
                fontWeight: active ? 600 : 500,
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.15s ease",
                background: active ? "rgba(56,189,248,0.10)" : "transparent",
                border: `1px solid ${active ? "rgba(56,189,248,0.22)" : "transparent"}`,
                color: active ? "var(--accent, #38BDF8)" : "var(--text-secondary, #94A3B8)",
                cursor: "pointer",
              }}>
                <span style={{ fontSize: 11, opacity: active ? 1 : 0.6 }}>{n.icon}</span>
                <span>{n.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Right — cluster status */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        {/* Cluster health pill */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
          borderRadius: 0,
          background: "rgba(16,185,129,0.08)",
          border: "1px solid rgba(16,185,129,0.18)",
        }}>
          <span className="status-dot live" style={{ background: "#10B981" }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: "#10B981", letterSpacing: "0.06em" }}>LIVE</span>
        </div>
        <span style={{ fontSize: 11, color: "var(--text-muted, #4B5563)" }}>minikube · default</span>
      </div>
    </nav>
  );
}
