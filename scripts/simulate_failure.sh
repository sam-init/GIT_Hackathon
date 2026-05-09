#!/bin/bash
# Cypher AI — Failure Simulation Scripts

API="http://localhost:8000"

echo "🚀 Cypher AI — Failure Simulator"
echo "=========================================="

simulate() {
  local scenario=$1
  local node=$2
  echo ""
  echo "⚡ Simulating: $scenario"
  curl -s -X POST "$API/graph/simulate/$node" | python3 -m json.tool 2>/dev/null | head -10
  echo ""
  echo "✓ Incident created. Check dashboard: http://localhost:3000"
}

reset() {
  echo "↺ Resetting topology..."
  curl -s -X POST "$API/graph/reset" > /dev/null
  echo "✓ Topology reset to healthy"
}

case "${1:-menu}" in
  auth)     simulate "auth-service CrashLoopBackOff" "auth-svc" ;;
  redis)    simulate "Redis OOMKilled" "redis" ;;
  postgres) simulate "PostgreSQL Connection Saturation" "postgres" ;;
  payment)  simulate "Payment Service Latency Spike" "payment-svc" ;;
  dns)      simulate "CoreDNS Crash" "ingress" ;;
  reset)    reset ;;
  menu)
    echo ""
    echo "Usage: ./simulate_failure.sh [scenario]"
    echo ""
    echo "Scenarios:"
    echo "  auth     — auth-service CrashLoopBackOff"
    echo "  redis    — Redis cluster OOMKilled"
    echo "  postgres — PostgreSQL connection saturation"
    echo "  payment  — payment-service latency spike"
    echo "  dns      — CoreDNS crash (cluster-wide DNS failure)"
    echo "  reset    — Reset all nodes to healthy"
    echo ""
    ;;
esac
