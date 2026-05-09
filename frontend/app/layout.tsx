import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cypher AI — AI Kubernetes Incident Intelligence",
  description: "AI-powered Kubernetes incident intelligence and attack graph platform. Reduce MTTR with graph-aware AI reasoning, blast radius visualization, and automated root cause analysis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
