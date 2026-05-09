package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

var backendURL = getEnv("WATCHER_BACKEND_URL", "http://localhost:8000")
var mockMode = getEnv("WATCHER_MOCK_MODE", "true") == "true"
var intervalSeconds, _ = strconv.Atoi(getEnv("WATCHER_INTERVAL_SECONDS", "10"))

type TelemetryPayload struct {
	Service          string `json:"service"`
	Status           string `json:"status"`
	RestartCount     int    `json:"restart_count"`
	RecentDeployment bool   `json:"recent_deployment"`
	LogsSummary      string `json:"logs_summary"`
	Namespace        string `json:"namespace"`
	NodeID           string `json:"node_id"`
}

var mockScenarios = []TelemetryPayload{
	{
		Service:          "auth-service",
		Status:           "CrashLoopBackOff",
		RestartCount:     7,
		RecentDeployment: true,
		LogsSummary:      "FATAL: dial tcp postgres:5432: connection refused\nFATAL: max_connections exceeded",
		Namespace:        "default",
		NodeID:           "auth-svc",
	},
	{
		Service:          "redis-cluster",
		Status:           "OOMKilled",
		RestartCount:     3,
		RecentDeployment: false,
		LogsSummary:      "FATAL: OOM command not allowed when used memory > maxmemory",
		Namespace:        "data",
		NodeID:           "redis",
	},
	{
		Service:          "payment-service",
		Status:           "Running",
		RestartCount:     0,
		RecentDeployment: false,
		LogsSummary:      "WARN: External payment gateway timeout after 5000ms\nERROR: Transaction queue depth: 847",
		Namespace:        "default",
		NodeID:           "payment-svc",
	},
}

func sendTelemetry(payload TelemetryPayload) {
	data, err := json.Marshal(payload)
	if err != nil {
		log.Printf("Error marshaling payload: %v", err)
		return
	}
	resp, err := http.Post(fmt.Sprintf("%s/telemetry", backendURL), "application/json", bytes.NewBuffer(data))
	if err != nil {
		log.Printf("Error sending telemetry: %v", err)
		return
	}
	defer resp.Body.Close()
	log.Printf("[watcher] Sent telemetry for %s (%s) → %d", payload.Service, payload.Status, resp.StatusCode)
}

func runMockMode() {
	log.Println("[watcher] Running in MOCK mode — replaying demo scenarios")
	ticker := time.NewTicker(time.Duration(intervalSeconds) * time.Second)
	i := 0
	for {
		select {
		case <-ticker.C:
			scenario := mockScenarios[i%len(mockScenarios)]
			log.Printf("[watcher] Mock event: %s/%s (restart_count=%d)", scenario.Namespace, scenario.Service, scenario.RestartCount)
			sendTelemetry(scenario)
			i++
		}
	}
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return fallback
}

func main() {
	log.Println("[watcher] Cypher AI Watcher Agent starting...")
	log.Printf("[watcher] Backend: %s | Mock: %v | Interval: %ds", backendURL, mockMode, intervalSeconds)

	if mockMode {
		runMockMode()
		return
	}

	// Real Kubernetes mode (requires in-cluster config or KUBECONFIG)
	log.Println("[watcher] Real Kubernetes mode — connect to cluster via KUBECONFIG")
	log.Println("[watcher] Real watcher not implemented in this build — switch WATCHER_MOCK_MODE=true for demo")
}
