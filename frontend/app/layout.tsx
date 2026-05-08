import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KubeGraph Sentinel — AI Kubernetes Incident Intelligence",
  description: "AI-powered Kubernetes incident intelligence and attack graph platform. Reduce MTTR with graph-aware AI reasoning, blast radius visualization, and automated root cause analysis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <div className="scanline-overlay" />
        {children}
      </body>
    </html>
  );
}
