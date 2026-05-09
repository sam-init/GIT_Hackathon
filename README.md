# MASTER PROMPT — AI-Powered Kubernetes Incident Intelligence & Attack Graph Platform

You are a senior staff-level platform engineer, SRE architect, Kubernetes engineer, frontend systems designer, AI infrastructure engineer, and DevOps tooling expert.

Your task is to build a complete production-style hackathon MVP called:

# “Cypher AI — AI-Powered Kubernetes Incident Intelligence Platform”

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

---

# LOCAL SETUP GUIDE

> Everything you need to run Cypher AI on your machine from scratch.

---

## Prerequisites

Make sure you have the following installed:

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.10 – 3.13 | [python.org](https://python.org) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| npm | 9+ | comes with Node.js |
| Go | 1.21+ (optional — for watcher agent) | [go.dev](https://go.dev) |

---

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/GIT_Hackathon.git
cd GIT_Hackathon
```

---

## 2. Environment Variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Open `.env` and set the following:

```env
# --- REQUIRED for AI features ---
NVIDIA_API_KEY=your_nvidia_api_key_here

# Model to use (default works, change if needed)
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=meta/llama-3.1-70b-instruct

# --- Backend config (defaults work locally) ---
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
CORS_ORIGINS=http://localhost:3000

# --- Frontend config (defaults work locally) ---
NEXT_PUBLIC_API_URL=http://localhost:8000

# --- Watcher agent (mock mode by default) ---
WATCHER_MOCK_MODE=true
WATCHER_BACKEND_URL=http://localhost:8000
WATCHER_INTERVAL_SECONDS=10
```

> **Getting an NVIDIA API key:**
> 1. Go to [https://build.nvidia.com](https://build.nvidia.com)
> 2. Sign up / log in
> 3. Navigate to **API Keys** and generate a new key
> 4. Paste it as `NVIDIA_API_KEY` in your `.env`
>
> **Note:** Without the key, all AI features (RCA, copilot, attack path explanation) still work — they return informative mock responses so the demo remains fully functional.

---

## 3. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Copy env (if not done already from root)
cp ../.env .env

# Start the backend API server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at:
- **API:** `http://localhost:8000`
- **Interactive docs:** `http://localhost:8000/docs`
- **Health check:** `http://localhost:8000/health`

> The backend automatically loads mock data from `../mock-data/` — no database setup required.

---

## 4. Frontend Setup

Open a **new terminal** in the project root:

```bash
cd frontend

# Install Node dependencies
npm install

# Start the dev server
npm run dev
```

The frontend will be available at:
- **Dashboard:** `http://localhost:3000`

> The frontend reads `NEXT_PUBLIC_API_URL` from `frontend/.env.local` (already set to `http://localhost:8000`). If your backend runs on a different port, update that file.

---

## 5. CLI Setup (Optional)

```bash
cd cli

# Install CLI dependencies
pip install -r requirements.txt

# Run any command
python kubesentinel.py --help
python kubesentinel.py scan
python kubesentinel.py incidents
python kubesentinel.py analyze auth-service
python kubesentinel.py attack-paths
python kubesentinel.py blast-radius auth-service
```

The CLI connects to `http://localhost:8000` by default. Override with:

```bash
KUBESENTINEL_API=http://your-backend:8000 python kubesentinel.py scan
```

---

## 6. Watcher Agent Setup (Optional)

> Requires Go 1.21+. Runs in mock mode by default — no live cluster needed.

```bash
cd watcher-agent

# Build
go build -o watcher ./cmd/watcher/

# Run in mock mode (sends simulated failure events to backend)
WATCHER_MOCK_MODE=true WATCHER_BACKEND_URL=http://localhost:8000 ./watcher
```

In mock mode the watcher replays realistic failure scenarios every 10 seconds, automatically creating incidents in the backend.

---

## 7. Failure Simulation (Demo)

With the backend running, trigger failure scenarios from a terminal:

```bash
# Make script executable
chmod +x scripts/simulate_failure.sh

# Available scenarios
./scripts/simulate_failure.sh auth      # auth-service CrashLoopBackOff
./scripts/simulate_failure.sh redis     # Redis cluster OOMKilled
./scripts/simulate_failure.sh postgres  # PostgreSQL connection saturation
./scripts/simulate_failure.sh payment   # payment-service latency spike
./scripts/simulate_failure.sh dns       # CoreDNS crash (cluster-wide)
./scripts/simulate_failure.sh reset     # Reset all nodes to healthy
```

Or trigger directly via the **"Trigger Failure"** button in the UI at `http://localhost:3000`.

---

## 8. Docker Compose (Full Stack, One Command)

```bash
# From project root
cp .env.example .env
# Edit .env and add NVIDIA_API_KEY

docker-compose up --build
```

Services:
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| Watcher Agent | (background, no UI) |

---

## Verify Everything is Working

```bash
# Backend health
curl http://localhost:8000/health
# → {"status":"ok","service":"kubesentinel-backend"}

# Incidents loaded
curl http://localhost:8000/incidents | python3 -m json.tool | head -20

# Graph topology
curl http://localhost:8000/graph | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Nodes: {len(d[\"nodes\"])}, Edges: {len(d[\"edges\"])}')"

# Attack paths
curl http://localhost:8000/graph/attack-paths | python3 -m json.tool
```

---

## Project Structure

```
GIT_Hackathon/
├── frontend/           # Next.js 16 — UI dashboard
│   ├── app/            # Pages (/, /incidents, /attack-paths, /copilot)
│   ├── components/     # TopologyGraph, IncidentPanel, AICopilot, RCAPanel, etc.
│   └── lib/api.ts      # API client
│
├── backend/            # FastAPI — incident engine + AI
│   ├── main.py         # App entry point
│   └── app/
│       ├── incidents/  # CRUD + mock data store
│       ├── graph/      # NetworkX engine (blast radius, attack paths)
│       ├── ai/         # NVIDIA LLM client + RCA prompt builder
│       ├── copilot/    # Conversational AI handler
│       └── ingestion/  # Telemetry ingest endpoint
│
├── watcher-agent/      # Go — Kubernetes event watcher (mock mode)
├── cli/                # Python Click — kubesentinel CLI tool
├── mock-data/          # Realistic incidents, topology, RCA fixtures
├── scripts/            # simulate_failure.sh demo scripts
├── infra/              # Kubernetes manifests + Prometheus setup
├── docker-compose.yml  # Full stack one-command start
├── .env.example        # Environment variable template
└── README.md           # This file
```

---

## Troubleshooting

**Backend won't start / import errors:**
```bash
pip install -r backend/requirements.txt --upgrade
```

**Frontend shows blank page:**
- Check that backend is running on port 8000
- Verify `frontend/.env.local` contains `NEXT_PUBLIC_API_URL=http://localhost:8000`

**AI features return mock responses:**
- Add `NVIDIA_API_KEY` to your `.env` file
- Restart the backend after changing env vars

**`/incidents/undefined` 404 in logs:**
- This was a Next.js 15+ async params bug — already fixed in the codebase.

**Port 3000 already in use:**
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
npm run dev
```

---

# MINIKUBE INTEGRATION GUIDE

> How to connect Cypher AI to your real minikube cluster running in WSL + Docker.

---

## Prerequisites

- minikube running (`minikube status` shows Running)
- kubectl accessible in WSL
- Backend running on `http://localhost:8000`

---

## Step 1 — Set Up kubectl in WSL

Your kubeconfig lives on the Windows side. Run this once to create a WSL-compatible copy:

```bash
mkdir -p ~/.kube

python3 -c "
import re
cfg = open('/mnt/c/Users/shrey/.kube/config').read()
cfg = re.sub(r'C:\\\\Users\\\\shrey\\\\', '/mnt/c/Users/shrey/', cfg)
cfg = re.sub(r'C:/Users/shrey/', '/mnt/c/Users/shrey/', cfg)
cfg = cfg.replace('\\\\\\\\', '/')
open('/home/shreyas/.kube/config','w').write(cfg)
print('Done')
"

chmod 600 ~/.kube/config
export KUBECONFIG=/home/shreyas/.kube/config

# Verify
kubectl get nodes
# → NAME       STATUS   ROLES           AGE   VERSION
# → minikube   Ready    control-plane   ...   v1.35.x
```

---

## Step 2 — Deploy Demo Services to Minikube

```bash
cd /mnt/d/programming/GIT_Hackathon

chmod +x infra/scripts/setup-minikube.sh
KUBECONFIG=/home/shreyas/.kube/config bash infra/scripts/setup-minikube.sh
```

This creates two namespaces and deploys:

| Resource | Namespace | Purpose |
|---|---|---|
| auth-service (×2 pods) | kubesentinel-demo | Auth microservice |
| payment-service | kubesentinel-demo | Payment microservice |
| order-service | kubesentinel-demo | Order microservice |
| notification-service | kubesentinel-demo | Notification microservice |
| admin-dashboard | kubesentinel-demo | Admin UI |
| postgresql-primary | kubesentinel-data | PostgreSQL database |
| redis-cluster | kubesentinel-data | Redis cache |
| auth-sa (ClusterRoleBinding → cluster-admin) | kubesentinel-demo | ⚠️ Intentional RBAC risk for attack path demo |
| postgres-credentials (Secret) | kubesentinel-data | DB secret accessible via attack path |

Verify:
```bash
kubectl get pods -n kubesentinel-demo
kubectl get pods -n kubesentinel-data
```

---

## Step 3 — Start the Real Kubernetes Watcher

```bash
cd watcher-agent

# Install dependencies (once)
pip install -r requirements.txt

# Run watcher pointing at your minikube cluster
KUBECONFIG=/home/shreyas/.kube/config \
WATCHER_BACKEND_URL=http://localhost:8000 \
WATCH_NAMESPACES=kubesentinel-demo,kubesentinel-data \
python3 k8s_watcher.py
```

The watcher:
- Polls pods every 15s for `CrashLoopBackOff`, `OOMKilled`, `ImagePullBackOff`, restart spikes
- Watches Kubernetes Warning events
- Detects over-privileged `ClusterRoleBindings` (finds `auth-sa → cluster-admin` immediately)
- Sends structured telemetry to `POST /telemetry` → auto-creates incidents

---

## Step 4 — Simulate Real Failures

With the watcher running, trigger actual Kubernetes failures:

```bash
chmod +x scripts/simulate_k8s_failure.sh

# Trigger auth-service CrashLoopBackOff (bad image)
./scripts/simulate_k8s_failure.sh auth

# Trigger Redis OOMKilled (4Mi memory limit)
./scripts/simulate_k8s_failure.sh redis

# Rapid restart spike (exit 1 in loop)
./scripts/simulate_k8s_failure.sh restart

# Scale payment-service to 0 (outage)
./scripts/simulate_k8s_failure.sh payment

# PostgreSQL connection saturation (telemetry injection)
./scripts/simulate_k8s_failure.sh db

# Force delete pods (node pressure simulation)
./scripts/simulate_k8s_failure.sh kill

# Check cluster + incident status
./scripts/simulate_k8s_failure.sh status

# Reset ALL services back to healthy
./scripts/simulate_k8s_failure.sh reset
```

---

## Step 5 — Watch It All Come Together

Open these simultaneously:

```bash
# Terminal 1 — Backend
cd backend && uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend && npm run dev

# Terminal 3 — Real Kubernetes Watcher
cd watcher-agent
KUBECONFIG=/home/shreyas/.kube/config python3 k8s_watcher.py

# Terminal 4 — Trigger a failure
./scripts/simulate_k8s_failure.sh auth
```

Then:
1. Watch the watcher terminal detect `CrashLoopBackOff` within ~15s
2. Open `http://localhost:3000` — see the incident appear in the panel
3. Click the incident → see the auto-generated AI RCA
4. The RBAC attack path (`auth-sa → cluster-admin`) appears on `/attack-paths` automatically

---

## Attack Path Demo (Auto-Detected)

The watcher detects the intentional over-privilege immediately on startup:

```
[RBAC] RISK: auth-sa in kubesentinel-demo → cluster-admin
       Binding: auth-sa-admin-binding
```

This creates a `SecurityAlert` incident in the backend. Visit `/attack-paths` to see:
- `auth-sa → cluster-admin → postgres-credentials + api-keys-secret`
- AI explanation of the privilege escalation risk
- Remediation kubectl commands

To clean up the risky binding after the demo:
```bash
kubectl delete clusterrolebinding auth-sa-admin-binding
```

---

## Teardown

Remove all demo resources from minikube:

```bash
KUBECONFIG=/home/shreyas/.kube/config kubectl delete namespace kubesentinel-demo kubesentinel-data
KUBECONFIG=/home/shreyas/.kube/config kubectl delete clusterrolebinding auth-sa-admin-binding 2>/dev/null || true
```
