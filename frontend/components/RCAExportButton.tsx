"use client";

interface RCA {
  root_cause?: string;
  summary?: string;
  evidence?: string[];
  affected_services?: string[];
  remediation?: string[];
  kubectl_commands?: string[];
  confidence_score?: number;
}

interface Props {
  incident: any;
  rca: RCA;
}

export function RCAExportButton({ incident, rca }: Props) {
  function generatePDF() {
    const now = new Date();
    const timestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";
    const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const sevColors: Record<string, string> = {
      critical: "#dc2626", high: "#d97706", medium: "#ca8a04", low: "#16a34a",
    };
    const sevColor = sevColors[incident.severity] || "#6b7280";
    const sevBg: Record<string, string> = {
      critical: "#fef2f2", high: "#fffbeb", medium: "#fefce8", low: "#f0fdf4",
    };
    const sevBgColor = sevBg[incident.severity] || "#f9fafb";

    const evidenceRows = (rca.evidence || []).map(e =>
      `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:13px;">• ${e}</td></tr>`
    ).join("");

    const affectedRows = (rca.affected_services || incident.blast_radius || []).map((s: string) =>
      `<span style="display:inline-block;margin:3px;padding:4px 12px;border-radius:20px;background:#fee2e2;color:#dc2626;font-size:12px;font-weight:600;">${s}</span>`
    ).join("");

    const remediationRows = (rca.remediation || []).map((step, i) =>
      `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;vertical-align:top;width:28px;">
          <div style="width:22px;height:22px;border-radius:50%;background:#0891b2;color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i + 1}</div>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:13px;">${step}</td>
      </tr>`
    ).join("");

    const kubectlRows = (rca.kubectl_commands || []).map(cmd =>
      `<div style="background:#0f172a;color:#a5f3fc;font-family:'Courier New',monospace;font-size:12px;padding:10px 14px;border-radius:6px;margin-bottom:8px;word-break:break-all;">$ ${cmd}</div>`
    ).join("");

    const blastRadiusSection = incident.blast_radius?.length > 0 ? `
      <div style="margin-bottom:28px;">
        <h2 style="font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px 0;padding-bottom:8px;border-bottom:2px solid #fee2e2;">
          💥 Blast Radius — ${incident.blast_radius.length} Service(s) Affected
        </h2>
        <div>${affectedRows}</div>
      </div>` : "";

    const confidence = rca.confidence_score ?? 70;
    const confColor = confidence >= 80 ? "#16a34a" : confidence >= 60 ? "#d97706" : "#dc2626";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RCA Report — ${incident.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; background: white; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .no-print { display: none; }
      @page { margin: 20mm 18mm; size: A4; }
    }
    .page { max-width: 800px; margin: 0 auto; padding: 40px 48px; }
    table { width: 100%; border-collapse: collapse; }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:3px solid #0891b2;">
    <div>
      <div style="font-size:11px;font-weight:700;color:#0891b2;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:4px;">KubeGraph Sentinel</div>
      <div style="font-size:22px;font-weight:800;color:#0f172a;line-height:1.2;">Root Cause Analysis Report</div>
      <div style="font-size:12px;color:#6b7280;margin-top:4px;">AI-Powered Kubernetes Incident Intelligence</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px;color:#9ca3af;">Generated</div>
      <div style="font-size:12px;font-weight:600;color:#374151;">${dateStr}</div>
      <div style="font-size:10px;color:#9ca3af;margin-top:2px;">${timestamp}</div>
    </div>
  </div>

  <!-- Incident Meta -->
  <div style="background:${sevBgColor};border:1px solid ${sevColor}33;border-left:4px solid ${sevColor};border-radius:8px;padding:16px 20px;margin-bottom:28px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
      <div>
        <div style="font-size:10px;font-weight:700;color:${sevColor};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">
          ${incident.severity?.toUpperCase()} SEVERITY — ${incident.status?.toUpperCase()}
        </div>
        <div style="font-size:18px;font-weight:700;color:#0f172a;">${incident.title}</div>
        <div style="font-size:12px;color:#6b7280;margin-top:4px;">
          ${incident.service} · ${incident.namespace} · ${incident.started_at?.slice(0, 16).replace("T", " ")} UTC
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:10px;color:#9ca3af;margin-bottom:2px;">Incident ID</div>
        <div style="font-family:'Courier New',monospace;font-size:12px;font-weight:600;color:#374151;">${incident.id}</div>
        <div style="margin-top:8px;">
          <span style="font-size:11px;font-weight:700;color:${confColor};">AI Confidence: ${confidence}%</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Executive Summary -->
  ${rca.summary ? `
  <div style="margin-bottom:28px;">
    <h2 style="font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px 0;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">
      📋 Executive Summary
    </h2>
    <p style="font-size:14px;color:#374151;line-height:1.7;background:#f8fafc;padding:16px;border-radius:6px;border-left:3px solid #0891b2;">${rca.summary}</p>
  </div>` : ""}

  <!-- Root Cause -->
  ${rca.root_cause ? `
  <div style="margin-bottom:28px;">
    <h2 style="font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px 0;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">
      🔍 Root Cause
    </h2>
    <div style="font-size:14px;font-weight:600;color:#0f172a;line-height:1.6;padding:14px 16px;background:#f0f9ff;border-radius:6px;border:1px solid #bae6fd;">${rca.root_cause}</div>
  </div>` : ""}

  <!-- Blast Radius -->
  ${blastRadiusSection}

  <!-- Evidence -->
  ${(rca.evidence || []).length > 0 ? `
  <div style="margin-bottom:28px;">
    <h2 style="font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px 0;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">
      🔎 Supporting Evidence
    </h2>
    <table>
      <tbody>${evidenceRows}</tbody>
    </table>
  </div>` : ""}

  <!-- Remediation -->
  ${(rca.remediation || []).length > 0 ? `
  <div style="margin-bottom:28px;">
    <h2 style="font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px 0;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">
      ✅ Remediation Steps
    </h2>
    <table>
      <tbody>${remediationRows}</tbody>
    </table>
  </div>` : ""}

  <!-- kubectl Commands -->
  ${(rca.kubectl_commands || []).length > 0 ? `
  <div style="margin-bottom:28px;">
    <h2 style="font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px 0;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">
      💻 kubectl Commands
    </h2>
    ${kubectlRows}
  </div>` : ""}

  <!-- Footer -->
  <div style="margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:11px;color:#9ca3af;">KubeGraph Sentinel — AI-Powered Kubernetes Incident Intelligence</div>
    <div style="font-size:11px;color:#9ca3af;">Confidential — Internal Use Only</div>
  </div>

</div>

<script>
  // Auto-print when opened in popup
  window.addEventListener('load', () => { window.print(); });
</script>
</body>
</html>`;

    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) { alert("Allow pop-ups to export PDF"); return; }
    win.document.write(html);
    win.document.close();
  }

  return (
    <button
      onClick={generatePDF}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "7px 14px", borderRadius: 7, fontSize: 11, fontWeight: 600,
        cursor: "pointer", transition: "all 0.2s",
        background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)",
        color: "#06b6d4",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(6,182,212,0.2)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(6,182,212,0.5)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(6,182,212,0.1)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(6,182,212,0.3)";
      }}
    >
      📄 Export PDF
    </button>
  );
}
