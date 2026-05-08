"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ─── Dynamic Hyperspeed (SSR-safe) ────────────────────────────────────────────
function HyperspeedBackground() {
  const [Comp, setComp] = useState<React.ComponentType<{ style?: React.CSSProperties }> | null>(null);
  useEffect(() => {
    import("@/components/Hyperspeed").then((m) => setComp(() => m.Hyperspeed));
  }, []);
  if (!Comp) return null;
  return <Comp style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
}

// ─── GSAP ScrollTrigger setup ─────────────────────────────────────────────────
function useScrollReveal(selectors: { ref: React.RefObject<HTMLElement | null>; cls: string; opts?: object }[]) {
  useEffect(() => {
    let ctx: any;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        selectors.forEach(({ ref, cls, opts }) => {
          if (!ref.current) return;
          const els = ref.current.querySelectorAll(cls);
          if (els.length === 0) return;
          gsap.from(els, {
            scrollTrigger: { trigger: ref.current, start: "top 76%", once: true },
            y: 26, opacity: 0, stagger: 0.11, duration: 0.6, ease: "power2.out",
            ...opts,
          });
        });
      });
    });
    return () => ctx?.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// ─── Small shared components ──────────────────────────────────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: "#38BDF8", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>
      {children}
    </div>
  );
}

function MetricCard({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div style={{ padding: "14px 18px", borderRadius: 0, background: "rgba(13,13,13,0.92)", border: "1px solid rgba(56,189,248,0.13)", backdropFilter: "blur(10px)", minWidth: 126 }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: "#38BDF8", letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 5 }}>{label}</div>
      {sub && <div style={{ fontSize: 9, color: "#334155", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── RCA demo card ────────────────────────────────────────────────────────────
function RCACard() {
  const cmds = [
    "kubectl rollout undo deployment/auth-service -n default",
    "kubectl logs auth-service-7d4b9c-xk2p -n default --previous",
    "kubectl describe pod auth-service-7d4b9c-xk2p -n default",
  ];
  return (
    <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 0, overflow: "hidden" }}>
      <div style={{ padding: "11px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 6, height: 6, borderRadius: 0, background: "#EF4444", flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.09em", textTransform: "uppercase" }}>AI Root Cause Analysis</span>
        <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: "#10B981" }}>92% Confidence</span>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>Root Cause</div>
        <div style={{ fontSize: 12, color: "#E2E8F0", lineHeight: 1.6, marginBottom: 12 }}>
          auth-service v2.4.1 introduced a PostgreSQL connection pool exhaustion — CrashLoopBackOff across 4 downstream services.
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
          {["auth-service", "frontend-service", "payment-service", "order-service"].map(s => (
            <span key={s} style={{ padding: "2px 7px", borderRadius: 0, fontSize: 9, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171", fontFamily: "monospace" }}>{s}</span>
          ))}
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>kubectl Commands</div>
        <div style={{ background: "var(--bg-base)", borderRadius: 0, border: "1px solid var(--border)", overflow: "hidden" }}>
          {cmds.map((cmd, i) => (
            <div key={i} style={{ padding: "7px 12px", borderBottom: i < cmds.length - 1 ? "1px solid var(--border)" : "none", display: "flex", gap: 8 }}>
              <span style={{ color: "#334155", fontFamily: "monospace", fontSize: 10, flexShrink: 0 }}>$</span>
              <span style={{ color: "#94A3B8", fontFamily: "monospace", fontSize: 10 }}>{cmd}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Architecture pipeline ────────────────────────────────────────────────────
function ArchPipeline() {
  const steps = [
    { label: "Minikube",    sub: "Kubernetes Cluster",   icon: "⬡" },
    { label: "Watcher",     sub: "Event Collector",       icon: "◉" },
    { label: "FastAPI",     sub: "Backend Engine",        icon: "▪" },
    { label: "AI Reasoning",sub: "Llama 3.1 70B",         icon: "◎" },
    { label: "Dashboard",   sub: "React Visualization",   icon: "◈" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
      {steps.map((s, i) => (
        <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
          <div className="arch-step" style={{ textAlign: "center", padding: "14px 18px" }}>
            <div style={{ width: 42, height: 42, borderRadius: 0, background: "var(--bg-panel)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: "#38BDF8", margin: "0 auto 9px" }}>{s.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#E2E8F0" }}>{s.label}</div>
            <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{s.sub}</div>
          </div>
          {i < steps.length - 1 && <div style={{ color: "var(--border-medium)", fontSize: 16, padding: "0 2px", flexShrink: 0 }}>→</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Main landing page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const problemRef = useRef<HTMLElement>(null);
  const graphRef   = useRef<HTMLElement>(null);
  const rcaRef     = useRef<HTMLElement>(null);
  const archRef    = useRef<HTMLElement>(null);
  const ctaRef     = useRef<HTMLElement>(null);

  useScrollReveal([
    { ref: problemRef, cls: ".reveal" },
    { ref: graphRef,   cls: ".reveal" },
    { ref: rcaRef,     cls: ".reveal" },
    { ref: archRef,    cls: ".arch-step", opts: { stagger: 0.09, y: 18 } },
    { ref: ctaRef,     cls: ".reveal" },
  ]);

  return (
    <div style={{ background: "var(--bg-base)", color: "#E2E8F0", fontFamily: "Inter, -apple-system, sans-serif", overflowX: "hidden" }}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", height: "100vh", minHeight: 620, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Hyperspeed — hero only */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <HyperspeedBackground />
        </div>

        {/* Readability overlay */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to bottom, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.52) 35%, rgba(0,0,0,0.88) 80%, #000000 100%)" }} />

        {/* Nav */}
        <nav style={{ position: "relative", zIndex: 10, height: 52, padding: "0 28px", display: "flex", alignItems: "center", borderBottom: "1px solid rgba(30,41,59,0.45)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 27, height: 27, borderRadius: 0, background: "#38BDF8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#0a0a0a", fontWeight: 800 }}>⬡</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0" }}>KubeGraph <span style={{ color: "#38BDF8" }}>Sentinel</span></div>
              <div style={{ fontSize: 8, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase" }}>AI Incident Intelligence</div>
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/" style={{ padding: "5px 13px", borderRadius: 0, fontSize: 12, fontWeight: 600, color: "#64748B", textDecoration: "none" }}>Dashboard</Link>
            <Link href="/incidents" style={{ padding: "5px 13px", borderRadius: 0, fontSize: 12, fontWeight: 600, color: "#64748B", textDecoration: "none" }}>Incidents</Link>
            <Link href="/" style={{ padding: "5px 14px", borderRadius: 0, fontSize: 12, fontWeight: 700, color: "#0a0a0a", textDecoration: "none", background: "#38BDF8" }}>Launch →</Link>
          </div>
        </nav>

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 20px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 13px", borderRadius: 0, background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", marginBottom: 26 }}>
            <div style={{ width: 5, height: 5, borderRadius: 0, background: "#38BDF8" }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "#38BDF8", letterSpacing: "0.08em" }}>KUBERNETES INCIDENT INTELLIGENCE PLATFORM</span>
          </div>

          <h1 style={{ fontSize: "clamp(30px, 5.2vw, 62px)", fontWeight: 800, color: "#F1F5F9", lineHeight: 1.11, letterSpacing: "-0.03em", maxWidth: 800, marginBottom: 20 }}>
            AI-Powered Kubernetes<br />Incident Intelligence
          </h1>

          <p style={{ fontSize: "clamp(14px, 1.5vw, 17px)", color: "#94A3B8", maxWidth: 540, lineHeight: 1.78, marginBottom: 34 }}>
            Visualize cascading failures, correlate infrastructure telemetry, and reduce Mean Time To Resolution with graph-native AI reasoning.
          </p>

          <div style={{ display: "flex", gap: 11, flexWrap: "wrap", justifyContent: "center", marginBottom: 48 }}>
            <Link href="/" style={{ padding: "11px 24px", borderRadius: 0, fontSize: 13, fontWeight: 700, color: "#0a0a0a", textDecoration: "none", background: "#38BDF8", display: "inline-flex", alignItems: "center", gap: 6 }}>
              Launch Platform <span>→</span>
            </Link>
            <a href="#architecture" style={{ padding: "11px 22px", borderRadius: 0, fontSize: 13, fontWeight: 600, color: "#94A3B8", textDecoration: "none", background: "rgba(10,10,10,0.85)", border: "1px solid var(--border)", backdropFilter: "blur(10px)" }}>
              View Architecture
            </a>
          </div>

          {/* Metrics */}
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap", justifyContent: "center" }}>
            <MetricCard value="19"  label="Cluster Nodes"   sub="minikube · default" />
            <MetricCard value="4"   label="Active Incidents" sub="3 critical" />
            <MetricCard value="24"  label="Service Edges"   sub="dependency graph" />
            <MetricCard value="68%" label="MTTR Reduction"  sub="vs. manual triage" />
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{ position: "relative", zIndex: 10, textAlign: "center", paddingBottom: 22, flexShrink: 0 }}>
          <div style={{ fontSize: 9, color: "#404040", letterSpacing: "0.1em", textTransform: "uppercase" }}>Scroll</div>
          <div style={{ fontSize: 14, color: "#404040", marginTop: 3 }}>↓</div>
        </div>
      </section>

      {/* ── THE PROBLEM ──────────────────────────────────────────────── */}
      <section ref={problemRef as any} style={{ padding: "96px 24px", maxWidth: 880, margin: "0 auto" }}>
        <Eyebrow>The Problem</Eyebrow>
        <h2 className="reveal" style={{ fontSize: "clamp(24px, 3.8vw, 44px)", fontWeight: 800, color: "#F1F5F9", lineHeight: 1.14, letterSpacing: "-0.025em", marginBottom: 38 }}>
          Modern Kubernetes environments are too complex to debug manually.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 32 }}>
          {[
            { stat: "10k+", label: "Log lines per incident",          desc: "Distributed across dozens of pods" },
            { stat: "8 min", label: "Avg. time to locate root cause",  desc: "Without automated correlation" },
            { stat: "4+",   label: "Teams involved per major outage",  desc: "Platform, app, data, network" },
            { stat: "73%",  label: "Incidents with cascading impact",  desc: "A single failure ripples downstream" },
          ].map(c => (
            <div key={c.label} className="reveal" style={{ padding: "20px 22px", borderRadius: 0, background: "var(--bg-panel)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#38BDF8", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 6 }}>{c.stat}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#E2E8F0", marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          ))}
        </div>
        <p className="reveal" style={{ fontSize: 15, color: "#64748B", lineHeight: 1.8 }}>
          Engineers drown in telemetry without the graph-level context to understand{" "}
          <em style={{ color: "#94A3B8", fontStyle: "normal" }}>what failed, why it propagated, and what to fix first.</em>
        </p>
      </section>

      {/* ── GRAPH VISIBILITY ─────────────────────────────────────────── */}
      <section ref={graphRef as any} style={{ padding: "80px 24px", background: "var(--bg-primary)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <Eyebrow>Graph-Native Visibility</Eyebrow>
            <h2 className="reveal" style={{ fontSize: "clamp(22px, 3.3vw, 38px)", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.025em", marginBottom: 13 }}>
              Infrastructure complexity made understandable.
            </h2>
            <p className="reveal" style={{ fontSize: 14, color: "#64748B", maxWidth: 510, margin: "0 auto", lineHeight: 1.78 }}>
              Live topology graph reveals real-time dependency chains, failure propagation paths, and blast radius — before you open a terminal.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {[
              { icon: "⬡", title: "Dependency Mapping",    desc: "Auto-discovered service graph across all Kubernetes workloads, ingress, databases, and caches." },
              { icon: "◉", title: "Failure Propagation",   desc: "Watch failures cascade in real time. Understand exactly which services are downstream." },
              { icon: "◈", title: "Blast Radius Analysis", desc: "Know the full scope of impact within seconds of detection — before remediation begins." },
            ].map(f => (
              <div key={f.title} className="reveal" style={{ padding: "22px 20px", borderRadius: 0, background: "var(--bg-panel)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 22, color: "#38BDF8", marginBottom: 13 }}>{f.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 7 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI INCIDENT REASONING ────────────────────────────────────── */}
      <section ref={rcaRef as any} style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 52, alignItems: "start" }}>
          <div>
            <Eyebrow>AI Incident Reasoning</Eyebrow>
            <h2 className="reveal" style={{ fontSize: "clamp(22px, 2.8vw, 36px)", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.02em", lineHeight: 1.17, marginBottom: 18 }}>
              Root cause, not just raw data.
            </h2>
            <p className="reveal" style={{ fontSize: 14, color: "#64748B", lineHeight: 1.8, marginBottom: 22 }}>
              The AI copilot correlates topology events with telemetry to produce structured RCA reports with evidence, affected services, and actionable kubectl remediation commands.
            </p>
            {[
              "Evidence-backed root cause identification",
              "Confidence scoring per analysis",
              "Instant kubectl remediation commands",
              "Blast radius and service impact map",
            ].map(f => (
              <div key={f} className="reveal" style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                <div style={{ width: 5, height: 5, borderRadius: 0, background: "#38BDF8", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#94A3B8" }}>{f}</span>
              </div>
            ))}
          </div>
          <div className="reveal"><RCACard /></div>
        </div>
      </section>

      {/* ── ARCHITECTURE ─────────────────────────────────────────────── */}
      <section ref={archRef as any} id="architecture" style={{ padding: "80px 24px", background: "var(--bg-primary)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow>Architecture</Eyebrow>
          <h2 style={{ fontSize: "clamp(20px, 2.8vw, 34px)", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.02em", marginBottom: 12 }}>
            End-to-end intelligence pipeline.
          </h2>
          <p style={{ fontSize: 14, color: "#64748B", marginBottom: 44, lineHeight: 1.7 }}>
            From Kubernetes cluster events to AI-synthesized incident intelligence in seconds.
          </p>
          <ArchPipeline />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section ref={ctaRef as any} style={{ padding: "120px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 540, margin: "0 auto" }}>
          <Eyebrow>Get Started</Eyebrow>
          <h2 className="reveal" style={{ fontSize: "clamp(26px, 3.8vw, 46px)", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.03em", lineHeight: 1.14, marginBottom: 16 }}>
            Incident intelligence,<br />not incident noise.
          </h2>
          <p className="reveal" style={{ fontSize: 15, color: "#64748B", lineHeight: 1.75, marginBottom: 34 }}>
            Launch the platform and start correlating your Kubernetes failures in real time.
          </p>
          <div className="reveal" style={{ display: "flex", gap: 11, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" style={{ padding: "12px 30px", borderRadius: 0, fontSize: 14, fontWeight: 700, color: "#0a0a0a", textDecoration: "none", background: "#38BDF8", display: "inline-flex", alignItems: "center", gap: 7 }}>
              Launch Platform <span>→</span>
            </Link>
            <Link href="/incidents" style={{ padding: "12px 26px", borderRadius: 0, fontSize: 14, fontWeight: 600, color: "#64748B", textDecoration: "none", background: "var(--bg-panel)", border: "1px solid var(--border)" }}>
              View Incidents
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 11, color: "#334155" }}>KubeGraph Sentinel — AI Kubernetes Incident Intelligence</div>
        <div style={{ fontSize: 11, color: "#334155" }}>HTF 2026</div>
      </footer>
    </div>
  );
}
