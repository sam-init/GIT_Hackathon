# MASTER PROMPT — AI-Powered Kubernetes Incident Intelligence & Attack Graph Platform

You are a senior staff-level platform engineer, SRE architect, Kubernetes engineer, frontend systems designer, AI infrastructure engineer, and DevOps tooling expert.

Your task is to build a complete production-style hackathon MVP called:

# “KubeGraph Sentinel — AI-Powered Kubernetes Incident Intelligence Platform”

This is NOT:

* a generic AI chatbot,
* a full observability platform,
* a Datadog clone,
* a SIEM,
* or a cybersecurity suite.

This IS:

> A Kubernetes-native AI incident intelligence and attack/failure graph platform focused on reducing MTTR (Mean Time To Resolution) by helping engineers understand infrastructure relationships, failure propagation, attack paths, and root causes visually.

The platform acts as:

* an AI reasoning layer,
* a Kubernetes relationship graph engine,
* and an operational copilot

on top of Kubernetes telemetry and infrastructure events.

---

# CORE PRODUCT VISION

Core workflow:

```txt id="1x08oj"
Infrastructure failure or security issue
→ telemetry/events collected
→ graph relationships analyzed
→ incident context generated
→ AI correlates infrastructure state
→ probable root cause generated
→ blast radius visualized
→ remediation suggestions shown
→ engineers resolve incidents faster
```

The platform should feel conceptually similar to:

* [BigPanda](https://www.bigpanda.io?utm_source=chatgpt.com)
* [Datadog](https://www.datadoghq.com?utm_source=chatgpt.com)
* [Splunk](https://www.splunk.com?utm_source=chatgpt.com)
* [PagerDuty](https://www.pagerduty.com?utm_source=chatgpt.com)

BUT differentiated through:

* Kubernetes-native topology understanding,
* graph-aware AI reasoning,
* infrastructure dependency mapping,
* attack-path analysis,
* blast radius visualization,
* failure propagation mapping,
* conversational operational copilot workflows,
* and developer-first operational tooling.

---

# CRITICAL PRODUCT PRINCIPLES

## 1. Event-driven, NOT chatbot-driven

BAD:

```txt id="hyknj2"
Paste logs manually into chatbot
```

GOOD:

```txt id="nj4vkm"
Cluster failure
→ telemetry collected automatically
→ graph relationships analyzed
→ incident generated automatically
→ AI RCA appears automatically
```

The AI should feel operationally integrated into infrastructure workflows.

---

# 2. Infrastructure-aware AI

The AI must understand:

* service dependencies,
* pod relationships,
* RBAC relationships,
* deployment changes,
* restart spikes,
* attack paths,
* affected services,
* cascading failures,
* topology relationships,
* and operational context.

The product differentiator is NOT:

```txt id="9g2fwa"
AI reads logs
```

The differentiator IS:

```txt id="1r1r73"
AI understands infrastructure relationships and failure propagation.
```

---

# 3. Frontend IS the product

This project is highly visual.

The frontend experience determines:

* perceived sophistication,
* enterprise quality,
* and judge impact.

The UI must look:

* modern,
* polished,
* enterprise-grade,
* operationally intelligent,
* and visually dynamic.

---

# 4. CLI TOOL IS REQUIRED

The platform MUST include a professional infrastructure/SRE/security-focused CLI tool.

The CLI is NOT optional.

The CLI acts as:

> the operational control surface for engineers.

The dashboard/GUI is the visualization layer.
The CLI is the engineering workflow layer.

The CLI should feel inspired by:

* kubectl,
* terraform,
* falco,
* and other infrastructure/security tooling.

---

# TARGET ARCHITECTURE

```txt id="m1kkvw"
Minikube Cluster
      ↓
Go Watcher Agent
      ↓
FastAPI Backend
      ↓
Graph Relationship Engine
      ↓
Incident Context Builder
      ↓
LLM Analysis
      ↓
Next.js Frontend + CLI
```

---

# REQUIRED TECH STACK

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* React Flow
* Framer Motion

## Backend

* FastAPI (Python)

## AI Layer

* NVIDIA-hosted LLM APIs

## Infrastructure

* Minikube
* Kubernetes
* Prometheus
* optional hidden Grafana

## Kubernetes Agent

* Go
* client-go Kubernetes SDK

## Graph Engine

* NetworkX

Optional later:

* PyTorch Geometric
* Graph Neural Networks

---

# REPO STRUCTURE

```txt id="x6byl7"
ai-sre-platform/
│
├── frontend/
├── backend/
├── watcher-agent/
├── cli/
├── infra/
├── graph-engine/
├── mock-data/
├── docs/
├── scripts/
├── docker-compose.yml
└── README.md
```

---

# FOLDER RESPONSIBILITIES

## frontend/

Responsible for:

* live topology graph
* AI copilot interface
* incident dashboard
* blast radius visualization
* failure propagation animations
* attack-path visualization
* incident timelines

Use:

* React Flow for graph visualization
* Framer Motion for transitions/animations

UI style:

* modern enterprise dashboard
* dark mode preferred
* clean operational design
* high information density without clutter

---

# backend/

Responsible for:

* telemetry ingestion
* incident creation
* incident correlation
* AI context building
* RCA generation
* remediation generation
* severity classification
* impacted services mapping
* incident timeline generation

Use:

* FastAPI
* async endpoints
* modular service structure

IMPORTANT:
Do NOT send raw logs directly to the LLM.

Instead preprocess:

* critical errors
* restart spikes
* deployment changes
* affected services
* graph relationships
* cluster topology context

Then generate compact structured prompts.

---

# watcher-agent/

Build a lightweight Kubernetes watcher in Go.

Responsibilities:

* monitor pod states
* detect CrashLoopBackOff
* monitor deployments
* detect restart spikes
* collect events
* fetch logs
* monitor RBAC relationships
* send structured telemetry to backend

Use:

* client-go
* Kubernetes watch APIs

The watcher should send structured JSON telemetry to backend.

Example payload:

```json id="kmc0zu"
{
  "service": "auth-service",
  "status": "CrashLoopBackOff",
  "restart_count": 7,
  "recent_deployment": true,
  "logs_summary": "postgres connection refused"
}
```

---

# graph-engine/

The graph engine is core infrastructure intelligence.

The graph must model:

* Pods
* Deployments
* Services
* RBAC Roles
* RoleBindings
* ServiceAccounts
* Secrets
* Databases
* Dependencies
* Network relationships

The graph engine should support:

* BFS/DFS traversal
* attack-path reasoning
* dependency tracing
* blast-radius analysis
* failure propagation
* privilege escalation path analysis

Use:

* NetworkX initially

Optional later:

* GNN-based risk scoring

---

# cli/

Build a professional operational CLI.

The CLI should support:

* cluster scanning
* incident inspection
* AI troubleshooting
* graph analysis
* attack-path inspection
* remediation assistance
* operational automation

Example commands:

```bash id="zjlwm1"
kubesentinel scan
```

Analyze topology and attack paths.

---

```bash id="qjlwm2"
kubesentinel incidents
```

List active incidents.

---

```bash id="1jlwm3"
kubesentinel analyze auth-service
```

AI analyzes failing service.

---

```bash id="9jlwm4"
kubesentinel logs auth-service --ai
```

Summarize logs using AI.

---

```bash id="5jlwm5"
kubesentinel trace payment-service
```

Show dependency/failure path.

---

```bash id="8jlwm6"
kubesentinel attack-paths
```

List high-risk attack paths.

---

```bash id="2jlwm7"
kubesentinel blast-radius auth-service
```

Show impacted downstream services.

---

```bash id="3jlwm8"
kubesentinel explain attack-path
```

AI explains privilege escalation/lateral movement risk.

---

# infra/

Responsible for:

* Minikube setup
* Kubernetes manifests
* Prometheus deployment
* mock service deployments
* failure simulation scripts

Provide scripts to simulate:

* pod crashes
* DB failures
* latency spikes
* deployment misconfigurations
* Redis outages
* DNS failures
* SSL expiry
* memory leaks

---

# mock-data/

Create realistic:

* incidents
* logs
* alerts
* timelines
* deployment events

Use realistic infrastructure language.

---

# REQUIRED MVP FEATURES

## MUST HAVE

### 1. Kubernetes Topology Graph

Visualize:

* services
* pods
* databases
* dependencies
* RBAC relationships

Use React Flow.

---

### 2. Failure Propagation Visualization

When a service fails:

* node turns red
* downstream services highlight
* blast radius becomes visible

This is one of the MOST IMPORTANT visual features.

---

### 3. Attack Path Visualization

Visualize:

* lateral movement
* RBAC privilege escalation
* exposed secrets
* risky dependencies

The graph should clearly show:

* possible attacker movement paths,
* privilege escalation chains,
* and high-risk nodes.

---

### 4. AI Root Cause Analysis

Every incident should generate:

* probable root cause
* supporting evidence
* affected services
* confidence score
* remediation suggestions
* kubectl debugging commands
* concise executive summary

Example:

```txt id="wjlwm9"
Root Cause:
Database connection saturation after deployment.

Evidence:
- restart spike on auth-service
- postgres connection refused
- deployment updated 2 minutes earlier

Affected Services:
- auth-service
- login-api
- admin-dashboard

Confidence:
87%

Suggested Commands:
kubectl logs auth-service
kubectl describe pod auth-service
kubectl rollout undo deployment/auth-service
```

---

### 5. Conversational AI Copilot

Provide chat-style interface where engineers can ask:

* “why is this pod crashing?”
* “which service caused this latency spike?”
* “what changed before this incident?”
* “show impacted services”
* “explain this attack path”

The AI must use:

* topology context
* incidents
* deployment history
* telemetry
* graph relationships
* and logs

to answer contextually.

---

### 6. Incident Timeline

Generate operational timeline:

```txt id="jjlwm10"
10:02 deployment updated
10:03 DB timeout started
10:04 auth-service restarted
10:05 login failures began
```

This should appear automatically.

---

### 7. Blast Radius Analysis

When failures occur:

* AI identifies impacted downstream services
* graph highlights affected nodes
* cascading impact becomes visible

---

# VECTOR DATABASE GUIDELINES

DO NOT store raw logs in vector DBs.

Correct architecture:

```txt id="xjlwm11"
Raw logs
→ preprocessing
→ incident summaries
→ embeddings
→ similarity search
```

Store only:

* incident summaries
* RCA summaries
* remediation history
* deployment correlations

Use vector DB ONLY for:

* semantic incident similarity
* historical retrieval
* operational memory

---

# STORAGE STRATEGY

Efficient telemetry strategy:

* deduplicate repetitive logs
* aggregate repeated errors
* discard noisy INFO logs
* retain incident intelligence rather than raw telemetry forever

Focus on:

* operational understanding
* not archival observability scale

---

# FEATURES TO CUT / AVOID

DO NOT BUILD:

* autonomous remediation
* real distributed tracing
* custom observability backends
* enterprise-scale Kafka systems
* full SIEM functionality
* advanced anomaly detection
* multi-cluster orchestration
* generic GitHub AI assistants
* unrelated README generators

Keep implementation complexity LOW while maximizing perceived sophistication.

---

# OPTIONAL GITHUB / DEPLOYMENT CONTEXT

The platform MAY optionally support:

* deployment correlation
* PR-to-incident mapping
* operational risk analysis

Example workflow:

```txt id="0jlwm12"
PR merged
→ deployment updated
→ auth-service failures begin
→ AI correlates deployment to outage
```

This should support:

* deployment-aware RCA
* postmortem generation
* operational change analysis

---

# IMPORTANT DESIGN PHILOSOPHY

Target:

```txt id="mjlwm13"
80% perceived sophistication
20% implementation complexity
```

The project should LOOK and FEEL enterprise-grade without unnecessary backend complexity.

---

# DEMO FLOW REQUIREMENTS

The final demo should work like this:

1. Healthy Kubernetes topology displayed
2. Failure simulated
3. Graph reacts visually
4. AI RCA generated automatically
5. Blast radius shown
6. Attack/failure path highlighted
7. Suggested remediation displayed
8. Incident timeline generated
9. MTTR reduction story demonstrated

---

# REQUIRED FAILURE SCENARIOS

Implement at least 5 polished scenarios:

* Kubernetes pod crash
* database connection saturation
* API latency spike
* deployment misconfiguration
* Redis outage
* DNS resolution failure
* memory leak simulation
* SSL certificate expiry

Each scenario should include:

* logs
* telemetry
* AI RCA
* remediation suggestions
* propagation visualization

---

# MOST IMPORTANT VISUAL PRIORITIES

Focus heavily on:

* topology graph polish
* attack-path visualization
* animations
* operational UX
* incident storytelling
* blast radius visualization
* intelligent dashboards

This project wins primarily through:

* visual operational intelligence,
* believable AI workflows,
* and polished incident experiences.

---

# EXECUTION ORDER

## Phase 1

Static frontend with mock infrastructure graph.

## Phase 2

Failure propagation animations.

## Phase 3

Backend telemetry ingestion.

## Phase 4

AI RCA integration.

## Phase 5

Minikube watcher integration.

## Phase 6

CLI integration.

## Phase 7

Demo stabilization and polish.

---

# FINAL PRODUCT GOAL

The final system should feel like:

> “An enterprise-grade AI Kubernetes incident intelligence and attack graph platform that understands infrastructure relationships, visualizes failure propagation, explains attack paths, and helps engineers resolve outages faster.”

NOT:

> “A chatbot that reads logs.”

Use:

* clean architecture,
* modular systems,
* scalable design patterns,
* production-style frontend design,
* and realistic infrastructure workflows throughout the implementation.
