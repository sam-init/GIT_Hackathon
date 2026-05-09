#!/bin/bash
# Cypher AI — Judge Demo Status
export KUBECONFIG=/home/shreyas/.kube/config

CYAN='\033[0;36m'; GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
BOLD='\033[1m'; NC='\033[0m'

clear
echo -e "${CYAN}${BOLD}"
echo "  ██╗  ██╗██╗   ██╗██████╗ ███████╗ ██████╗ ██████╗  █████╗ ██████╗ ██╗  ██╗"
echo "  ██║ ██╔╝██║   ██║██╔══██╗██╔════╝██╔════╝ ██╔══██╗██╔══██╗██╔══██╗██║  ██║"
echo "  █████╔╝ ██║   ██║██████╔╝█████╗  ██║  ███╗██████╔╝███████║██████╔╝███████║"
echo "  ██╔═██╗ ██║   ██║██╔══██╗██╔══╝  ██║   ██║██╔══██╗██╔══██║██╔═══╝ ██╔══██║"
echo "  ██║  ██╗╚██████╔╝██████╔╝███████╗╚██████╔╝██║  ██║██║  ██║██║     ██║  ██║"
echo "  ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝"
echo -e "${NC}"
echo -e "${CYAN}  S E N T I N E L   —   AI-Powered Kubernetes Incident Intelligence${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Cluster info
echo -e "\n${BOLD}  🌐 CLUSTER${NC}"
NODE=$(kubectl get nodes --no-headers 2>/dev/null | awk '{print $1, "["$2"]", "k8s:"$5}')
echo -e "  ${GREEN}●${NC} ${NODE}"

# Demo services namespace
echo -e "\n${BOLD}  🔧 MICROSERVICES  (namespace: kubesentinel-demo)${NC}"
kubectl get pods -n kubesentinel-demo --no-headers 2>/dev/null | while read line; do
  name=$(echo $line | awk '{print $1}')
  ready=$(echo $line | awk '{print $2}')
  status=$(echo $line | awk '{print $3}')
  restarts=$(echo $line | awk '{print $4}')
  age=$(echo $line | awk '{print $5}')
  if [[ "$status" == "Running" ]]; then
    echo -e "  ${GREEN}●${NC} ${name}   ${GREEN}${status}${NC}  ready:${ready}  restarts:${restarts}  age:${age}"
  else
    echo -e "  ${RED}●${NC} ${name}   ${RED}${status}${NC}  ready:${ready}  restarts:${restarts}  age:${age}"
  fi
done

# Data namespace
echo -e "\n${BOLD}  🗄️  DATA SERVICES  (namespace: kubesentinel-data)${NC}"
kubectl get pods -n kubesentinel-data --no-headers 2>/dev/null | while read line; do
  name=$(echo $line | awk '{print $1}')
  ready=$(echo $line | awk '{print $2}')
  status=$(echo $line | awk '{print $3}')
  restarts=$(echo $line | awk '{print $4}')
  age=$(echo $line | awk '{print $5}')
  if [[ "$status" == "Running" ]]; then
    echo -e "  ${GREEN}●${NC} ${name}   ${GREEN}${status}${NC}  ready:${ready}  restarts:${restarts}  age:${age}"
  else
    echo -e "  ${RED}●${NC} ${name}   ${RED}${status}${NC}  ready:${ready}  restarts:${restarts}  age:${age}"
  fi
done

# RBAC attack path
echo -e "\n${BOLD}  🔑 RBAC RISK DETECTION${NC}"
RISKY=$(kubectl get clusterrolebindings --no-headers 2>/dev/null | grep "auth-sa-admin")
if [[ -n "$RISKY" ]]; then
  echo -e "  ${RED}⚠${NC}  auth-sa → cluster-admin binding DETECTED  ${RED}[CRITICAL]${NC}"
  echo -e "     Attack path: auth-sa → cluster-admin → postgres-credentials"
else
  echo -e "  ${GREEN}✓${NC}  No over-privileged bindings detected"
fi

# Secrets
echo -e "\n${BOLD}  🔒 SECRETS IN SCOPE${NC}"
kubectl get secrets -n kubesentinel-data --no-headers 2>/dev/null | grep -v "default-token\|kubernetes" | while read line; do
  name=$(echo $line | awk '{print $1}')
  echo -e "  ${YELLOW}🔐${NC} $name  (kubesentinel-data)"
done
kubectl get secrets -n kubesentinel-demo --no-headers 2>/dev/null | grep -v "default-token\|kubernetes" | while read line; do
  name=$(echo $line | awk '{print $1}')
  echo -e "  ${YELLOW}🔐${NC} $name  (kubesentinel-demo)"
done

# Backend incidents
echo -e "\n${BOLD}  🚨 LIVE INCIDENTS (via Cypher AI API)${NC}"
python3 -c "
import httpx, sys
try:
    r = httpx.get('http://localhost:8000/incidents', timeout=3)
    incidents = r.json()
    colors = {'critical':'\033[0;31m','high':'\033[1;33m','medium':'\033[1;33m','low':'\033[0;32m'}
    nc = '\033[0m'
    status_sym = {'active':'●','investigating':'◐','resolved':'○'}
    for i in incidents:
        c = colors.get(i['severity'], '')
        sym = status_sym.get(i['status'], '●')
        print(f\"  {c}{sym}{nc} [{i['severity'].upper()}] {i['id']} — {i['title'][:60]}\")
    if not incidents:
        print('  No incidents — cluster healthy')
except:
    print('  Backend not reachable (start uvicorn)')
" 2>/dev/null

# Services summary
echo -e "\n${BOLD}  📡 PLATFORM ENDPOINTS${NC}"
echo -e "  ${GREEN}●${NC} Frontend Dashboard   →  http://localhost:3000"
echo -e "  ${GREEN}●${NC} Backend API          →  http://localhost:8000"
echo -e "  ${GREEN}●${NC} API Docs (Swagger)   →  http://localhost:8000/docs"
echo -e "  ${CYAN}●${NC} Watcher Agent        →  polling every 15s"

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${BOLD}Trigger failure:${NC}  ./scripts/simulate_k8s_failure.sh auth"
echo -e "  ${BOLD}Reset cluster:${NC}   ./scripts/simulate_k8s_failure.sh reset"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
