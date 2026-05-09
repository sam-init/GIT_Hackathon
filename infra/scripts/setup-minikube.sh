#!/bin/bash
# Cypher AI — Minikube Setup Script
# Deploys all demo services to your minikube cluster

set -e
export KUBECONFIG=/home/shreyas/.kube/config

GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
info() { echo -e "  ${CYAN}→${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC}  $1"; }

KUBECTL_BIN="kubectl"
if ! command -v "${KUBECTL_BIN}" >/dev/null 2>&1; then
  if command -v kubectl.exe >/dev/null 2>&1; then
    KUBECTL_BIN="kubectl.exe"
  fi
fi

if ! command -v "${KUBECTL_BIN}" >/dev/null 2>&1; then
  echo "ERROR: kubectl not found (checked kubectl and kubectl.exe)."
  exit 1
fi

echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  Cypher AI — Minikube Setup${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Verify cluster is reachable
info "Verifying cluster connectivity..."
"${KUBECTL_BIN}" cluster-info --request-timeout=5s > /dev/null 2>&1 || {
  echo "ERROR: Cannot reach cluster. Make sure minikube is running."
  echo "  Run: minikube start --driver=docker"
  exit 1
}
ok "Cluster reachable: $("${KUBECTL_BIN}" get nodes --no-headers | awk '{print $1, $2}')"

# Apply all manifests
info "Applying manifests..."
for f in infra/manifests/*.yaml; do
  echo "    Applying $f..."
  "${KUBECTL_BIN}" apply -f "$f" 2>&1 | sed 's/^/      /'
done
ok "All manifests applied"

# Wait for pods to be ready
info "Waiting for demo services to start..."
"${KUBECTL_BIN}" rollout status deployment/auth-service      -n kubesentinel-demo --timeout=90s 2>/dev/null && ok "auth-service ready"      || warn "auth-service not ready yet"
"${KUBECTL_BIN}" rollout status deployment/payment-service   -n kubesentinel-demo --timeout=60s 2>/dev/null && ok "payment-service ready"   || warn "payment-service not ready yet"
"${KUBECTL_BIN}" rollout status deployment/order-service     -n kubesentinel-demo --timeout=60s 2>/dev/null && ok "order-service ready"     || warn "order-service not ready yet"
"${KUBECTL_BIN}" rollout status deployment/postgresql-primary -n kubesentinel-data --timeout=90s 2>/dev/null && ok "postgresql ready"       || warn "postgresql not ready yet"
"${KUBECTL_BIN}" rollout status deployment/redis-cluster     -n kubesentinel-data --timeout=60s 2>/dev/null && ok "redis-cluster ready"     || warn "redis-cluster not ready yet"

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Setup complete!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo "Cluster summary:"
"${KUBECTL_BIN}" get pods -n kubesentinel-demo 2>/dev/null
echo ""
"${KUBECTL_BIN}" get pods -n kubesentinel-data 2>/dev/null
echo ""
echo "Next steps:"
echo "  1. Start watcher:  cd watcher-agent && python k8s_watcher.py"
echo "  2. Simulate:       ./scripts/simulate_k8s_failure.sh auth"
echo "  3. Dashboard:      http://localhost:3000"
echo "  4. Check status:   ./scripts/simulate_k8s_failure.sh status"
echo ""
echo "Attack path demo (RBAC):"
echo "  kubectl get clusterrolebindings | grep auth-sa-admin"
echo "  → auth-sa has cluster-admin — watcher will alert on this"
