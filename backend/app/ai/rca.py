import json
from app.ai.client import call_llm

SYSTEM_PROMPT = """You are KubeGraph Sentinel, an expert Kubernetes SRE AI.
You analyze infrastructure incidents using topology relationships, telemetry, and graph context.
You do NOT just read logs. You understand service dependencies, failure propagation, RBAC relationships, and attack paths.
Always respond with structured JSON matching the RCA schema exactly."""

RCA_SCHEMA = """{
  "root_cause": "concise technical root cause",
  "evidence": ["evidence item 1", "evidence item 2"],
  "affected_services": ["service1", "service2"],
  "confidence_score": 85,
  "remediation": ["step 1", "step 2"],
  "kubectl_commands": ["kubectl cmd1", "kubectl cmd2"],
  "summary": "one paragraph executive summary"
}"""


def _build_rca_prompt(incident: dict) -> str:
    telemetry = incident.get("telemetry", {})
    timeline = incident.get("timeline", [])
    blast = incident.get("blast_radius", [])
    timeline_str = "\n".join(f"  {e['time']} - {e['event']}" for e in timeline)
    return f"""KUBERNETES INCIDENT ANALYSIS REQUEST

Service: {incident.get('service', 'unknown')}
Namespace: {incident.get('namespace', 'default')}
Severity: {incident.get('severity', 'unknown')}
Status: {telemetry.get('status', 'unknown')}
Restart Count: {telemetry.get('restart_count', 0)}
Recent Deployment: {telemetry.get('recent_deployment', False)}

Log Summary:
{telemetry.get('logs_summary', 'No logs available')}

Blast Radius (downstream affected services):
{json.dumps(blast, indent=2)}

Incident Timeline:
{timeline_str}

Analyze this incident using the infrastructure graph context.
Return a JSON object matching this exact schema:
{RCA_SCHEMA}
Return ONLY valid JSON, no markdown."""


async def generate_rca(incident: dict) -> dict:
    if incident.get("rca"):
        return incident["rca"]
    prompt = _build_rca_prompt(incident)
    raw = await call_llm(prompt, SYSTEM_PROMPT, max_tokens=1500)
    try:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        return json.loads(raw[start:end])
    except Exception:
        return {
            "root_cause": raw[:300],
            "evidence": [],
            "affected_services": incident.get("blast_radius", []),
            "confidence_score": 70,
            "remediation": ["Manual investigation required"],
            "kubectl_commands": [f"kubectl describe pod -n {incident.get('namespace','default')}"],
            "summary": raw[:500],
        }
