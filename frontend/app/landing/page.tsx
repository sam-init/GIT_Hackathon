"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./landing.module.css";

/* ─── Static Data ─────────────────────────────────────────── */

const FEATURES = [
  {
    icon: "⬡",
    title: "Auto-Discovery",
    desc: "Zero-config mapping of every CRD and service mesh link across namespaces.",
  },
  {
    icon: "◎",
    title: "Blast Radius Calculation",
    desc: "Predictive modeling of failure propagation points across your entire cluster.",
  },
  {
    icon: "⟳",
    title: "Live Graph Sync",
    desc: "Real-time topology updates streamed via gRPC — no polling, no lag.",
  },
  {
    icon: "⚡",
    title: "Sub-second RCA",
    desc: "AI-driven trace synthesis identifies the exact config change that triggered the failure.",
  },
];

const METRICS = [
  { label: "MTTR Reduction", value: "94%", sub: "avg across enterprise clients" },
  { label: "Clusters Monitored", value: "12k+", sub: "in production today" },
  { label: "Incidents Resolved", value: "400k+", sub: "with AI root cause analysis" },
  { label: "Uptime SLA", value: "99.99%", sub: "guaranteed platform availability" },
];

const PRECISION_CARDS = [
  {
    tag: "ANALYSIS",
    title: "Root Cause Analysis",
    desc: "AI-driven trace synthesis identifies the exact line of code or config change that triggered the failure.",
    color: "#38bdf8",
  },
  {
    tag: "PROPAGATION",
    title: "Failure Propagation",
    desc: "Visualize how a single pod failure cascades through your microservices architecture in real-time.",
    color: "#818cf8",
  },
  {
    tag: "CORRELATION",
    title: "Metric Correlation",
    desc: "Automatically aligns logs, metrics, and traces onto a single timeline for instant context.",
    color: "#34d399",
  },
];

const CLI_LINES = [
  { delay: 0, text: "$ cypher connect --cluster prod-us-east-1", type: "cmd" },
  { delay: 600, text: "✓ Connected to prod-us-east-1 (42 nodes, 318 pods)", type: "ok" },
  { delay: 1200, text: "$ cypher incident analyze INC-0492", type: "cmd" },
  { delay: 1800, text: "⟳ Fetching topology snapshot...", type: "info" },
  { delay: 2400, text: "⟳ Correlating metrics & traces (t-48h)...", type: "info" },
  { delay: 3200, text: "━━━ ROOT CAUSE IDENTIFIED ━━━━━━━━━━━━━━━━", type: "divider" },
  { delay: 3800, text: "  Component : payment-api:v2.1.4", type: "result" },
  { delay: 4200, text: "  Cause     : Memory leak → PG connection pool saturation", type: "result" },
  { delay: 4600, text: "  Blast     : order-service, billing-worker (2 downstream)", type: "result" },
  { delay: 5000, text: "  Fix       : Roll back to payment-api:v2.1.3", type: "result" },
  { delay: 5600, text: "✓ Report saved to /reports/INC-0492-rca.md", type: "ok" },
  { delay: 6200, text: "$ _", type: "cursor" },
];

const NAV_LINKS = ["Platform", "Clusters", "Alerts", "Pricing", "Docs"];

/* ─── Animated CLI Component ─────────────────────────────── */
function AnimatedCLI() {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);

  useEffect(() => {
    CLI_LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, i]);
      }, line.delay);
    });
  }, []);

  return (
    <div className={styles.cliWindow}>
      <div className={styles.cliTitleBar}>
        <span className={styles.cliDot} style={{ background: "#ef4444" }} />
        <span className={styles.cliDot} style={{ background: "#f59e0b" }} />
        <span className={styles.cliDot} style={{ background: "#10b981" }} />
        <span className={styles.cliTitle}>cypher-cli — zsh</span>
      </div>
      <div className={styles.cliBody}>
        {CLI_LINES.map((line, i) =>
          visibleLines.includes(i) ? (
            <div
              key={i}
              className={`${styles.cliLine} ${styles[`cli_${line.type}`]}`}
            >
              {line.text}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

/* ─── Topology SVG Mini Demo ─────────────────────────────── */
function TopologyDemo() {
  const nodes = [
    { id: "ingress", x: 50, y: 50, label: "Ingress", status: "healthy" },
    { id: "api-gw", x: 200, y: 50, label: "API-GW", status: "healthy" },
    { id: "payment", x: 350, y: 30, label: "payment-api", status: "critical" },
    { id: "order", x: 350, y: 100, label: "order-svc", status: "warning" },
    { id: "postgres", x: 500, y: 50, label: "Postgres", status: "critical" },
    { id: "billing", x: 500, y: 130, label: "billing-worker", status: "warning" },
    { id: "redis", x: 200, y: 150, label: "Redis", status: "healthy" },
  ];
  const edges = [
    ["ingress", "api-gw"], ["api-gw", "payment"], ["api-gw", "order"],
    ["payment", "postgres"], ["order", "postgres"], ["order", "billing"],
    ["api-gw", "redis"],
  ];
  const statusColor: Record<string, string> = {
    healthy: "#10b981", warning: "#f59e0b", critical: "#ef4444",
  };
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className={styles.topoDemoWrap}>
      <svg viewBox="0 0 580 200" className={styles.topoSvg} preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow-cyan">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-red">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {edges.map(([a, b], i) => {
          const na = nodeMap[a]; const nb = nodeMap[b];
          const isCriticalEdge = na?.status === "critical" || nb?.status === "critical";
          return (
            <line
              key={i}
              x1={na.x + 40} y1={na.y + 16} x2={nb.x + 40} y2={nb.y + 16}
              stroke={isCriticalEdge ? "rgba(239,68,68,0.5)" : "rgba(56,189,248,0.2)"}
              strokeWidth={isCriticalEdge ? 1.5 : 1}
              strokeDasharray={isCriticalEdge ? "4 3" : "none"}
            />
          );
        })}
        {nodes.map((n) => (
          <g key={n.id} transform={`translate(${n.x},${n.y})`}>
            <rect
              width={80} height={32} rx={4}
              fill="rgba(17,24,39,0.9)"
              stroke={statusColor[n.status]}
              strokeWidth={n.status === "critical" ? 1.5 : 1}
              filter={n.status === "critical" ? "url(#glow-red)" : n.status === "healthy" ? "url(#glow-cyan)" : undefined}
            />
            <circle cx={10} cy={16} r={4} fill={statusColor[n.status]} />
            <text x={20} y={20} fontSize="9" fill="#d4e4fa" fontFamily="'JetBrains Mono', monospace">
              {n.label}
            </text>
          </g>
        ))}
      </svg>
      <div className={styles.topoLegend}>
        <span className={styles.legendDot} style={{ background: "#10b981" }} /> Healthy
        <span className={styles.legendDot} style={{ background: "#f59e0b", marginLeft: 16 }} /> Degraded
        <span className={styles.legendDot} style={{ background: "#ef4444", marginLeft: 16 }} /> Critical
      </div>
    </div>
  );
}

/* ─── Incident Card ──────────────────────────────────────── */
function IncidentCard() {
  return (
    <div className={styles.incidentCard}>
      <div className={styles.incidentHeader}>
        <span className={styles.incidentBadge}>CRITICAL</span>
        <span className={styles.incidentTime}>4m ago</span>
      </div>
      <div className={styles.incidentTitle}>Automated RCA Report</div>
      <div className={styles.incidentId}>Incident #492-AX · payment-api namespace</div>
      <div className={styles.incidentDivider} />
      <div className={styles.incidentLabel}>THE VERDICT</div>
      <div className={styles.incidentVerdict}>
        A memory leak in the recently deployed{" "}
        <code className={styles.incidentCode}>payment-api:v2.1.4</code> is
        preventing database connection release. This is saturating the Postgres
        connection pool, causing upstream{" "}
        <code className={styles.incidentCode}>order-service</code> to timeout.
      </div>
      <div className={styles.incidentFooter}>
        <div className={styles.incidentAction}>View Full RCA →</div>
        <div className={styles.incidentAction}>Auto-Remediate →</div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className={styles.root}>
      {/* Scanline overlay */}
      <div className={styles.scanlineOverlay} />

      {/* ── Navbar ── */}
      <header className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
        <div className={styles.navInner}>
          <div className={styles.navBrand}>
            <span className={styles.navLogo}>⬡</span>
            <span className={styles.navName}>Cypher<span className={styles.navAccent}> AI</span></span>
          </div>
          <nav className={styles.navLinks}>
            {NAV_LINKS.map((l) => (
              <a key={l} href="#" className={styles.navLink}>{l}</a>
            ))}
          </nav>
          <div className={styles.navActions}>
            <a href="#" className={styles.btnGhost}>Sign in</a>
            <a href="#" className={styles.btnPrimary}>Get Early Access</a>
          </div>
          <button className={styles.hamburger} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
        {mobileOpen && (
          <div className={styles.mobileMenu}>
            {NAV_LINKS.map((l) => <a key={l} href="#" className={styles.mobileLink}>{l}</a>)}
            <a href="#" className={styles.btnPrimary} style={{ marginTop: 8 }}>Get Early Access</a>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroBg}>
          <div className={styles.heroGlow1} />
          <div className={styles.heroGlow2} />
          <div className={styles.heroGrid} />
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            AI-FIRST KUBERNETES INTELLIGENCE
          </div>
          <h1 className={styles.heroTitle}>
            Stop chasing logs.<br />
            <span className={styles.heroTitleAccent}>Understand your infrastructure.</span>
          </h1>
          <p className={styles.heroDesc}>
            KubeSentry AI understands your infrastructure's topology, identifies failure
            propagation, and provides root cause analysis in seconds — not hours.
          </p>
          <div className={styles.heroActions}>
            <a href="#" className={styles.btnPrimary} style={{ padding: "14px 32px", fontSize: 15 }}>
              Start Free Trial
            </a>
            <a href="#demo" className={styles.btnGhost} style={{ padding: "14px 28px", fontSize: 15 }}>
              Watch Demo →
            </a>
          </div>
          <div className={styles.heroStats}>
            {METRICS.map((m) => (
              <div key={m.label} className={styles.heroStatItem}>
                <div className={styles.heroStatValue}>{m.value}</div>
                <div className={styles.heroStatLabel}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual */}
        <div className={styles.heroVisual}>
          <div className={styles.heroVisualCard}>
            <div className={styles.heroVisualHeader}>
              <div className={styles.heroVisualDots}>
                <span style={{ background: "#ef4444" }} />
                <span style={{ background: "#f59e0b" }} />
                <span style={{ background: "#10b981" }} />
              </div>
              <span className={styles.heroVisualTag}>LIVE TOPOLOGY · prod-us-east-1</span>
              <span className={styles.heroVisualLive}>● LIVE</span>
            </div>
            <TopologyDemo />
            <IncidentCard />
          </div>
        </div>
      </section>

      {/* ── Trusted by ── */}
      <section className={styles.trusted}>
        <div className={styles.container}>
          <p className={styles.trustedLabel}>TRUSTED BY PLATFORM TEAMS AT</p>
          <div className={styles.trustedLogos}>
            {["Stripe", "Datadog", "Notion", "Linear", "Vercel", "PlanetScale"].map((co) => (
              <span key={co} className={styles.trustedLogo}>{co}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Pillars ── */}
      <section className={styles.section} id="platform">
        <div className={styles.container}>
          <div className={styles.sectionTag}>PLATFORM</div>
          <h2 className={styles.sectionTitle}>Deep Infrastructure<br />Topology Awareness</h2>
          <p className={styles.sectionDesc}>
            Traditional monitoring shows you a list of alerts. Cypher AI visualizes the actual
            relationship between services, ingress controllers, and persistent volumes to
            understand the full blast radius.
          </p>
          <div className={styles.featureGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <div className={styles.featureTitle}>{f.title}</div>
                <div className={styles.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Precision Engineering ── */}
      <section className={styles.section} style={{ background: "rgba(1,15,31,0.6)" }}>
        <div className={styles.container}>
          <div className={styles.sectionTag}>PRECISION ENGINEERING</div>
          <h2 className={styles.sectionTitle}>Built for Reliability Teams</h2>
          <p className={styles.sectionDesc}>
            High-performance tools designed for the speed of modern cloud-native deployment cycles.
          </p>
          <div className={styles.precisionGrid}>
            {PRECISION_CARDS.map((c) => (
              <div key={c.title} className={styles.precisionCard}>
                <div className={styles.precisionTag} style={{ color: c.color, borderColor: `${c.color}40` }}>{c.tag}</div>
                <div className={styles.precisionTitle}>{c.title}</div>
                <div className={styles.precisionDesc}>{c.desc}</div>
                <div className={styles.precisionArrow} style={{ color: c.color }}>→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLI Demo ── */}
      <section className={styles.section} id="demo">
        <div className={styles.container}>
          <div className={styles.cliLayout}>
            <div className={styles.cliLeft}>
              <div className={styles.sectionTag}>DEVELOPER EXPERIENCE</div>
              <h2 className={styles.sectionTitle}>Designed for<br />Terminal Power Users</h2>
              <p className={styles.sectionDesc}>
                The Cypher CLI puts AI intelligence directly into your terminal workflow.
                Get instant root-cause analysis without ever leaving your IDE.
              </p>
              <ul className={styles.cliFeatureList}>
                <li>⟳ Real-time incident streaming via gRPC</li>
                <li>⬡ AI-powered RCA in a single command</li>
                <li>◎ Auto-remediation with change preview</li>
                <li>⚡ Native kubectl plugin support</li>
              </ul>
              <a href="#" className={styles.btnPrimary} style={{ marginTop: 32, display: "inline-block" }}>
                Install CLI →
              </a>
            </div>
            <div className={styles.cliRight}>
              <AnimatedCLI />
            </div>
          </div>
        </div>
      </section>

      {/* ── Metrics Banner ── */}
      <section className={styles.metricsSection}>
        <div className={styles.container}>
          <div className={styles.metricsGrid}>
            {METRICS.map((m) => (
              <div key={m.label} className={styles.metricItem}>
                <div className={styles.metricValue}>{m.value}</div>
                <div className={styles.metricLabel}>{m.label}</div>
                <div className={styles.metricSub}>{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <div className={styles.ctaGlow} />
        <div className={styles.container} style={{ position: "relative", zIndex: 1 }}>
          <div className={styles.ctaTag}>GET STARTED TODAY</div>
          <h2 className={styles.ctaTitle}>Achieve Perfect<br />Operational Clarity</h2>
          <p className={styles.ctaDesc}>
            Join 400+ platform teams using Cypher AI to eliminate Kubernetes downtime.
            <br />AI-First Observability for the Kubernetes ecosystem.
          </p>
          <div className={styles.ctaActions}>
            <a href="#" className={styles.btnPrimary} style={{ padding: "16px 40px", fontSize: 16 }}>
              Start Free — No credit card
            </a>
            <a href="#" className={styles.btnGhost} style={{ padding: "16px 32px", fontSize: 16 }}>
              Talk to Sales
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <span className={styles.navLogo}>⬡</span>
              <span className={styles.navName}>Cypher<span className={styles.navAccent}> AI</span></span>
              <p className={styles.footerTagline}>
                AI-First Observability for the Kubernetes ecosystem.<br />
                Engineered for high-scale enterprise environments.
              </p>
            </div>
            <div className={styles.footerLinks}>
              <div className={styles.footerCol}>
                <div className={styles.footerColTitle}>Product</div>
                {["Platform", "Status", "Documentation", "Changelog"].map((l) => (
                  <a key={l} href="#" className={styles.footerLink}>{l}</a>
                ))}
              </div>
              <div className={styles.footerCol}>
                <div className={styles.footerColTitle}>Company</div>
                {["About", "Blog", "Careers", "Legal"].map((l) => (
                  <a key={l} href="#" className={styles.footerLink}>{l}</a>
                ))}
              </div>
              <div className={styles.footerCol}>
                <div className={styles.footerColTitle}>Resources</div>
                {["Community", "API Docs", "Privacy", "Security"].map((l) => (
                  <a key={l} href="#" className={styles.footerLink}>{l}</a>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>© 2024 Cypher AI. All rights reserved. Built for the Kubernetes ecosystem.</span>
            <div className={styles.footerSocials}>
              <a href="#" className={styles.socialLink}>GitHub</a>
              <a href="#" className={styles.socialLink}>Twitter</a>
              <a href="#" className={styles.socialLink}>Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
