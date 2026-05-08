#!/bin/bash
# KubeGraph Sentinel — Real Kubernetes Failure Simulator
# Triggers actual pod failures in your minikube cluster

set -e
export KUBECONFIG=/home/shreyas/.kube/config
NS="kubesentinel-demo"
NS_DATA="kubesentinel-data"
API="http://localhost:8000"

RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'

banner() { echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo -e "${CYAN}  ⚡ $1${NC}"; echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"; }
ok()     { echo -e "  ${GREEN}✓${NC} $1"; }
warn()   { echo -e "  ${YELLOW}⚠${NC}  $1"; }
info()   { echo -e "  ${CYAN}→${NC} $1"; }

wait_for_pod() {
  local app=$1 ns=$2
  info "Waiting for $app pods to be ready..."
  kubectl rollout status deployment/$app -n $ns --timeout=60s 2>/dev/null || true
}

# ─── SCENARIO 1: auth-service CrashLoopBackOff ───────────────────
scenario_auth_crash() {
  banner "SCENARIO: auth-service CrashLoopBackOff"
  warn "Setting invalid image → pod will crash on every start"
  kubectl set image deployment/auth-service auth-service=nginx:nonexistent-tag-crash -n $NS
  info "Pods entering CrashLoopBackOff / ImagePullBackOff..."
  info "Watcher will detect this and create INC in ~${POLL_INTERVAL:-15}s"
  info "Watch live: kubectl get pods -n $NS -w"
}

# ─── SCENARIO 2: Redis OOMKilled ─────────────────────────────────
scenario_redis_oom() {
  banner "SCENARIO: Redis OOMKilled (memory limit 4Mi)"
  warn "Setting absurdly low memory limit → kubelet will OOMKill"
  kubectl patch deployment redis-cluster -n $NS_DATA --type=json \
    -p='[{"op":"replace","path":"/spec/template/spec/containers/0/resources/limits/memory","value":"4Mi"}]'
  kubectl rollout restart deployment/redis-cluster -n $NS_DATA
  info "Redis will be OOMKilled on startup..."
  info "Watch: kubectl get pods -n $NS_DATA -w"
}

# ─── SCENARIO 3: auth-service restart spike ──────────────────────
scenario_restart_spike() {
  banner "SCENARIO: auth-service Restart Spike"
  warn "Injecting exit-1 command → rapid CrashLoopBackOff restarts"
  kubectl patch deployment auth-service -n $NS --type=json \
    -p='[{"op":"add","path":"/spec/template/spec/containers/0/command","value":["sh","-c","echo starting && sleep 3 && exit 1"]}]'
  info "auth-service will restart every ~3s — restart spike detected"
  info "Watch: kubectl get pods -n $NS -w"
}

# ─── SCENARIO 4: payment-service scale to 0 (outage) ────────────
scenario_payment_outage() {
  banner "SCENARIO: payment-service Outage (scaled to 0)"
  warn "Scaling payment-service to 0 replicas → all traffic fails"
  kubectl scale deployment payment-service --replicas=0 -n $NS
  # Also send manual telemetry since watcher only catches pod events
  curl -s -X POST "$API/telemetry" \
    -H "Content-Type: application/json" \
    -d '{"service":"payment-service","status":"Pending","restart_count":0,"recent_deployment":false,"logs_summary":"All payment-service replicas scaled to 0. Service unavailable.","namespace":"kubesentinel-demo","node_id":"payment-svc"}' \
    > /dev/null
  ok "Telemetry sent → incident created in dashboard"
  info "Restore: kubectl scale deployment payment-service --replicas=1 -n $NS"
}

# ─── SCENARIO 5: DB connection saturation (simulate) ─────────────
scenario_db_saturation() {
  banner "SCENARIO: PostgreSQL Connection Saturation"
  warn "Sending telemetry directly to backend (simulates DB event)"
  curl -s -X POST "$API/telemetry" \
    -H "Content-Type: application/json" \
    -d '{
      "service":"postgresql-primary",
      "status":"CrashLoopBackOff",
      "restart_count":4,
      "recent_deployment":false,
      "logs_summary":"FATAL: max_connections exceeded (100/100). Connection pool saturation. New connections being refused.",
      "namespace":"kubesentinel-data",
      "node_id":"postgres"
    }' | python3 -m json.tool 2>/dev/null
  ok "DB saturation incident created"
}

# ─── SCENARIO 6: Force pod deletion (simulate node failure) ──────
scenario_kill_pods() {
  banner "SCENARIO: Force Pod Deletion (Node Pressure Simulation)"
  warn "Deleting all auth-service pods (simulates node eviction)"
  kubectl delete pods -l app=auth-service -n $NS --force --grace-period=0 2>/dev/null || true
  ok "Pods deleted — Kubernetes will restart them (watch restart count increase)"
  info "Watch: kubectl get pods -n $NS -w"
}

# ─── RESET ───────────────────────────────────────────────────────
scenario_reset() {
  banner "RESET: Restoring all services to healthy state"

  # Restore auth-service to nginx
  kubectl set image deployment/auth-service auth-service=nginx:alpine -n $NS 2>/dev/null || true
  kubectl patch deployment auth-service -n $NS --type=json \
    -p='[{"op":"remove","path":"/spec/template/spec/containers/0/command"}]' 2>/dev/null || true
  kubectl rollout restart deployment/auth-service -n $NS 2>/dev/null || true

  # Restore redis memory
  kubectl patch deployment redis-cluster -n $NS_DATA --type=json \
    -p='[{"op":"replace","path":"/spec/template/spec/containers/0/resources/limits/memory","value":"512Mi"}]' 2>/dev/null || true
  kubectl rollout restart deployment/redis-cluster -n $NS_DATA 2>/dev/null || true

  # Restore payment-service replicas
  kubectl scale deployment payment-service --replicas=1 -n $NS 2>/dev/null || true

  # Reset graph in backend
  curl -s -X POST "$API/graph/reset" > /dev/null

  ok "All deployments restored"
  ok "Backend graph reset to healthy"
  info "Pod status: kubectl get pods -n $NS && kubectl get pods -n $NS_DATA"
}

# ─── STATUS ───────────────────────────────────────────────────────
scenario_status() {
  banner "Current Cluster Status"
  echo ""
  echo "── Demo Services ($NS) ──────────────────────────"
  kubectl get pods,deployments -n $NS 2>/dev/null || echo "  (namespace not found — run setup first)"
  echo ""
  echo "── Data Services ($NS_DATA) ─────────────────────"
  kubectl get pods,deployments -n $NS_DATA 2>/dev/null || echo "  (namespace not found — run setup first)"
  echo ""
  echo "── Backend Incidents ────────────────────────────"
  curl -s "$API/incidents" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    for i in d:
        print(f'  [{i[\"severity\"].upper()}] {i[\"id\"]} — {i[\"title\"]} ({i[\"status\"]})')
    if not d: print('  No incidents')
except: print('  Backend not reachable')
"
}

# ─── MENU ────────────────────────────────────────────────────────
case "${1:-menu}" in
  auth)     scenario_auth_crash ;;
  redis)    scenario_redis_oom ;;
  restart)  scenario_restart_spike ;;
  payment)  scenario_payment_outage ;;
  db)       scenario_db_saturation ;;
  kill)     scenario_kill_pods ;;
  reset)    scenario_reset ;;
  status)   scenario_status ;;
  menu|*)
    echo -e "\n${CYAN}KubeGraph Sentinel — Kubernetes Failure Simulator${NC}"
    echo -e "${CYAN}Targets real minikube cluster${NC}\n"
    echo "Usage: ./simulate_k8s_failure.sh <scenario>"
    echo ""
    echo "Scenarios:"
    echo "  auth     — auth-service CrashLoopBackOff (bad image)"
    echo "  redis    — Redis OOMKilled (memory limit 4Mi)"
    echo "  restart  — auth-service rapid restart spike (exit 1)"
    echo "  payment  — payment-service scaled to 0 (outage)"
    echo "  db       — PostgreSQL connection saturation (telemetry)"
    echo "  kill     — Force delete auth-service pods (node pressure)"
    echo "  reset    — Restore ALL services to healthy"
    echo "  status   — Show cluster state + backend incidents"
    echo ""
    ;;
esac
