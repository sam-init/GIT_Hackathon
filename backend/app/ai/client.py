import os
import httpx
import re
import hashlib
import time
import json
import asyncio
from typing import Dict, Any, Optional, List

# ========== CONFIGURATION (can be overridden by env) ==========
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "")
NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
NVIDIA_MODEL = os.getenv("NVIDIA_MODEL", "meta/llama-3.1-70b-instruct")
NVIDIA_TIMEOUT = float(os.getenv("NVIDIA_TIMEOUT", "25.0"))
NVIDIA_MAX_RETRIES = int(os.getenv("NVIDIA_MAX_RETRIES", "3"))
NVIDIA_CACHE_TTL = int(os.getenv("NVIDIA_CACHE_TTL", "300"))   # seconds
NVIDIA_TEMPERATURE = float(os.getenv("NVIDIA_TEMPERATURE", "0.3"))
NVIDIA_MAX_INPUT_TOKENS = int(os.getenv("NVIDIA_MAX_INPUT_TOKENS", "8000"))  # rough limit

# ========== SIMPLE IN‑MEMORY CACHE ==========
_cache: Dict[str, Dict[str, Any]] = {}  # key -> {"response": str, "timestamp": float, "threat": str, "confidence": float}

def _get_cache_key(prompt: str, system: str, max_tokens: int) -> str:
    """Create a unique hash key for the request."""
    content = f"{system}|||{prompt}|||{max_tokens}|||{NVIDIA_MODEL}|||{NVIDIA_TEMPERATURE}"
    return hashlib.sha256(content.encode()).hexdigest()

def _is_cache_valid(entry: Dict[str, Any]) -> bool:
    return (time.time() - entry["timestamp"]) < NVIDIA_CACHE_TTL

# ========== HELPER: TRUNCATE PROMPT TO AVOID TOKEN LIMIT ==========
def _truncate_prompt(prompt: str, system: str, max_tokens_output: int) -> tuple[str, str]:
    """
    Roughly truncates prompt + system to stay under model's input limit.
    """
    max_input_chars = (NVIDIA_MAX_INPUT_TOKENS - max_tokens_output - 200) * 4
    combined = system + prompt
    if len(combined) <= max_input_chars:
        return prompt, system
    # Truncate prompt first (system is more important)
    excess = len(combined) - max_input_chars
    if len(prompt) > excess:
        truncated_prompt = prompt[:len(prompt)-excess-100] + "...\n[TRUNCATED due to length]"
        return truncated_prompt, system
    else:
        truncated_system = system[:len(system)-excess-100] + "...\n[TRUNCATED]"
        return prompt, truncated_system

# ========== NEW: CONFIDENCE & THREAT SCORING (from response or fallback) ==========
def _extract_confidence(response: str) -> float:
    """Try to extract a confidence score (0-100) from the LLM response. Fallback to 70."""
    match = re.search(r'confiden[ct]e\s*[:\-]\s*(\d{1,3})', response, re.IGNORECASE)
    if match:
        return min(100, max(0, int(match.group(1))))
    # Also look for "Confidence: high/medium/low"
    if re.search(r'confiden[ct]e.*high', response, re.IGNORECASE):
        return 85.0
    if re.search(r'confiden[ct]e.*medium', response, re.IGNORECASE):
        return 60.0
    if re.search(r'confiden[ct]e.*low', response, re.IGNORECASE):
        return 35.0
    return 70.0  # default

def _classify_threat(prompt: str, response: str) -> str:
    """Return threat level: 'critical', 'high', 'medium', 'low', 'info'."""
    q = (prompt + " " + response).lower()
    if any(w in q for w in ["rbac", "cluster-admin", "privilege escalation", "attack", "compromised", "crypto", "backdoor"]):
        return "critical"
    if any(w in q for w in ["oom", "crashloop", "downtime", "outage", "5xx"]):
        return "high"
    if any(w in q for w in ["latency", "slow", "timeout", "warning"]):
        return "medium"
    if any(w in q for w in ["info", "note", "mock"]):
        return "low"
    return "info"

# ========== NEW: SIMPLE INCIDENT FINGERPRINT (for caching & correlation) ==========
def _fingerprint_incident(prompt: str, context: dict) -> str:
    """Return a short fingerprint (e.g., 'oom-redis') for the incident type."""
    q = prompt.lower()
    if "oom" in q or "memory" in q:
        return "oom"
    if "crashloop" in q or "restarting" in q:
        return "crashloop"
    if "rbac" in q or "privilege" in q or "attack" in q:
        return "rbac-attack"
    if "blast radius" in q or "impact" in q:
        return "blast-radius"
    if "latency" in q or "slow" in q or "timeout" in q:
        return "latency"
    return "general"

# ========== CORE LLM CALLER WITH CACHE, RETRIES, TRUNCATION ==========
async def call_llm(prompt: str, system: str, max_tokens: int = 1024, context: dict = {}) -> str:
    """
    Enhanced NVIDIA LLM caller with caching, retries, prompt truncation,
    and intelligent fallback. Returns the LLM response as a string.
    Does NOT throw exceptions to the caller (always returns string).
    """
    # 1. Check cache
    cache_key = _get_cache_key(prompt, system, max_tokens)
    if cache_key in _cache and _is_cache_valid(_cache[cache_key]):
        print(f"[LLM] Cache hit for key {cache_key[:8]}...")
        cached = _cache[cache_key]
        # Optionally log threat/confidence (doesn't affect return)
        print(f"[LLM] Cached threat: {cached.get('threat', 'unknown')}, confidence: {cached.get('confidence', 70)}%")
        return cached["response"]

    # 2. If no API key, use smart mock directly (no caching of mock to keep dynamic)
    if not NVIDIA_API_KEY:
        print("[LLM] No API key – using smart mock")
        mock_resp = _smart_mock_response(prompt, context)
        # Still cache mock responses? Optional – caching mock saves nothing, but we can skip.
        # We'll store in cache anyway for consistency (TTL will expire)
        _cache[cache_key] = {
            "response": mock_resp,
            "timestamp": time.time(),
            "threat": _classify_threat(prompt, mock_resp),
            "confidence": _extract_confidence(mock_resp)
        }
        return mock_resp

    # 3. Truncate prompt if needed
    safe_prompt, safe_system = _truncate_prompt(prompt, system, max_tokens)

    # 4. Prepare request
    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": NVIDIA_MODEL,
        "messages": [
            {"role": "system", "content": safe_system},
            {"role": "user", "content": safe_prompt},
        ],
        "max_tokens": max_tokens,
        "temperature": NVIDIA_TEMPERATURE,
    }

    # 5. Retry loop with exponential backoff
    last_error = None
    for attempt in range(NVIDIA_MAX_RETRIES):
        try:
            async with httpx.AsyncClient(timeout=NVIDIA_TIMEOUT) as client:
                print(f"[LLM] Attempt {attempt+1}/{NVIDIA_MAX_RETRIES} – sending request")
                resp = await client.post(
                    f"{NVIDIA_BASE_URL}/chat/completions",
                    json=payload,
                    headers=headers
                )
                resp.raise_for_status()
                result = resp.json()["choices"][0]["message"]["content"]

                # NEW: Extract metadata
                threat = _classify_threat(prompt, result)
                confidence = _extract_confidence(result)
                fingerprint = _fingerprint_incident(prompt, context)

                # Store in cache
                _cache[cache_key] = {
                    "response": result,
                    "timestamp": time.time(),
                    "threat": threat,
                    "confidence": confidence,
                    "fingerprint": fingerprint
                }
                print(f"[LLM] Success. Threat: {threat}, Confidence: {confidence}%")
                return result

        except httpx.TimeoutException as e:
            last_error = e
            wait = 2 ** attempt
            print(f"[LLM] Timeout (attempt {attempt+1}), retrying in {wait}s")
            await asyncio.sleep(wait)
        except httpx.HTTPStatusError as e:
            last_error = e
            if e.response.status_code == 429:  # rate limit
                wait = 2 ** attempt * 2
                print(f"[LLM] Rate limited (429), retrying in {wait}s")
                await asyncio.sleep(wait)
            elif 500 <= e.response.status_code < 600:
                wait = 2 ** attempt
                print(f"[LLM] Server error {e.response.status_code}, retrying")
                await asyncio.sleep(wait)
            else:
                # Client error – no retry
                print(f"[LLM] Client error {e.response.status_code}: {e.response.text[:200]}")
                break
        except Exception as e:
            last_error = e
            print(f"[LLM] Unexpected error: {type(e).__name__} – {e}")
            break

    # 6. All retries failed – fallback to smart mock
    print(f"[LLM] All retries failed. Falling back to mock. Last error: {last_error}")
    mock_resp = _smart_mock_response(prompt, context)
    _cache[cache_key] = {
        "response": mock_resp,
        "timestamp": time.time(),
        "threat": _classify_threat(prompt, mock_resp),
        "confidence": _extract_confidence(mock_resp)
    }
    return mock_resp


# ========== EXISTING SMART MOCK (unchanged, but we keep exactly as you wrote) ==========
def _smart_mock_response(prompt: str, context: dict = {}) -> str:
    """
    Context-aware mock response that actually reads the user's question
    and answers from the cluster context. Used when no NVIDIA_API_KEY is set.
    """
    q = prompt.lower()
    incidents = context.get("incidents", [])
    nodes = context.get("nodes", [])
    attack_paths = context.get("attack_paths", [])

    # Pick out relevant incidents
    critical = [i for i in incidents if i.get("severity") == "critical"]
    active   = [i for i in incidents if i.get("status") == "active"]

    # --- Route based on question keywords ---

    if any(w in q for w in ["crash", "crashloop", "auth"]):
        return (
            "**auth-service CrashLoopBackOff Analysis**\n\n"
            "The `auth-service` is in CrashLoopBackOff because its container is exiting immediately on start. "
            "Common causes:\n"
            "- Bad image tag (ImagePullBackOff → container never starts)\n"
            "- Missing environment variable or secret (`JWT_SECRET`, `DB_PASSWORD`)\n"
            "- Dependency on `postgres` or `redis` not yet ready\n\n"
            "**Graph analysis:** auth-service depends on `postgres` (kubesentinel-data). "
            "Blast radius includes `payment-service`, `order-service`, `frontend-svc`.\n\n"
            "**Fix:**\n"
            "```\n"
            "kubectl describe pod -l app=auth-service -n kubesentinel-demo\n"
            "kubectl logs -l app=auth-service -n kubesentinel-demo --previous\n"
            "kubectl set image deployment/auth-service auth-service=nginx:alpine -n kubesentinel-demo\n"
            "```\n\n"
            "_(Mock mode — set NVIDIA_API_KEY for live LLM analysis)_"
        )

    if any(w in q for w in ["redis", "cache", "oom", "memory"]):
        return (
            "**Redis OOMKilled Analysis**\n\n"
            "`redis-cluster` was killed by the kubelet because it exceeded its memory limit. "
            "This causes the cache layer to go offline, impacting all services that depend on it.\n\n"
            "**Affected services (blast radius):** `auth-service`, `payment-service`, `order-service`\n\n"
            "**Fix:**\n"
            "```\n"
            "# Increase memory limit\n"
            "kubectl patch deployment redis-cluster -n kubesentinel-data \\\n"
            "  --type=json -p='[{\"op\":\"replace\",\"path\":\"/spec/template/spec/containers/0/resources/limits/memory\",\"value\":\"512Mi\"}]'\n"
            "kubectl rollout restart deployment/redis-cluster -n kubesentinel-data\n"
            "```\n\n"
            "_(Mock mode — set NVIDIA_API_KEY for live LLM analysis)_"
        )

    if any(w in q for w in ["attack", "rbac", "privilege", "escalat", "security"]):
        return (
            "**RBAC Attack Path Detected**\n\n"
            "`auth-sa` (ServiceAccount in `kubesentinel-demo`) is bound to `cluster-admin` via "
            "`auth-sa-admin-binding`. This is a critical misconfiguration.\n\n"
            "**Attack chain:**\n"
            "```\n"
            "auth-sa → cluster-admin → ALL namespaces\n"
            "       → can read: postgres-credentials (kubesentinel-data)\n"
            "       → can read: api-keys-secret (kubesentinel-demo)\n"
            "```\n\n"
            "**Remediation:**\n"
            "```\n"
            "# Remove the over-privileged binding\n"
            "kubectl delete clusterrolebinding auth-sa-admin-binding\n\n"
            "# Scope auth-sa to only what it needs\n"
            "kubectl create rolebinding auth-sa-scoped \\\n"
            "  --role=auth-role --serviceaccount=kubesentinel-demo:auth-sa -n kubesentinel-data\n"
            "```\n\n"
            "_(Mock mode — set NVIDIA_API_KEY for live LLM analysis)_"
        )

    if any(w in q for w in ["blast", "impact", "affect", "downstream"]):
        return (
            "**Blast Radius Analysis**\n\n"
            "Based on the graph topology (NetworkX BFS traversal):\n\n"
            "| Failure Origin | Affected Downstream Services |\n"
            "|---|---|\n"
            "| auth-service | payment-svc, order-svc, frontend-svc, notification-svc |\n"
            "| postgres | auth-svc, payment-svc, order-svc |\n"
            "| redis | auth-svc, payment-svc, order-svc |\n"
            "| ingress | ALL services (cluster-wide) |\n\n"
            "The graph has 19 nodes and 24 edges. auth-service has the highest fan-out.\n\n"
            "_(Mock mode — set NVIDIA_API_KEY for live LLM analysis)_"
        )

    if any(w in q for w in ["payment", "latency", "slow", "p99", "timeout"]):
        return (
            "**payment-service Latency Analysis**\n\n"
            "`payment-service` P99 latency is >8s, likely caused by:\n"
            "- Upstream dependency on `postgres` connection saturation\n"
            "- Redis cache miss rate spike (if redis is degraded)\n"
            "- Stripe API external timeout\n\n"
            "**Fix:**\n"
            "```\n"
            "kubectl top pods -n kubesentinel-demo\n"
            "kubectl logs -l app=payment-service -n kubesentinel-demo | grep ERROR\n"
            "```\n\n"
            "_(Mock mode — set NVIDIA_API_KEY for live LLM analysis)_"
        )

    if any(w in q for w in ["fix", "remediat", "how", "resolve", "what should"]):
        active_titles = [i["title"] for i in active[:3]]
        return (
            f"**Recommended Remediation Steps**\n\n"
            f"Active incidents right now: {len(active)}\n\n"
            + ("\n".join(f"- {t}" for t in active_titles) if active_titles else "- No active incidents")
            + "\n\n**General runbook:**\n"
            "1. Check pod logs: `kubectl logs <pod> -n kubesentinel-demo --previous`\n"
            "2. Check events: `kubectl get events -n kubesentinel-demo --sort-by=.lastTimestamp`\n"
            "3. Restart affected deployment: `kubectl rollout restart deployment/<name> -n kubesentinel-demo`\n"
            "4. Reset demo cluster: `./scripts/simulate_k8s_failure.sh reset`\n\n"
            "_(Mock mode — set NVIDIA_API_KEY for live LLM analysis)_"
        )

    if any(w in q for w in ["healthy", "status", "overview", "summary", "what"]):
        crit_count = len(critical)
        return (
            f"**Cluster Status Summary**\n\n"
            f"- **Total incidents:** {len(incidents)} ({len(active)} active)\n"
            f"- **Critical:** {crit_count}\n"
            f"- **Nodes in graph:** {len(nodes)}\n"
            f"- **Attack paths:** {len(attack_paths)} detected\n\n"
            + (f"Most critical: **{critical[0]['title']}**\n" if critical else "")
            + "\nRun `./scripts/demo_status.sh` for full cluster view.\n\n"
            "_(Mock mode — set NVIDIA_API_KEY for live LLM analysis)_"
        )

    # Default fallback — at least acknowledge the message
    return (
        f"⚠️ **Mock mode active** — no `NVIDIA_API_KEY` configured.\n\n"
        f"Your question: *\"{prompt.split('USER QUESTION:')[-1].strip()[:120]}\"*\n\n"
        f"To get a real AI response, add your NVIDIA API key to `.env`:\n"
        f"```\nNVIDIA_API_KEY=your_key_here\n```\n"
        f"Get a free key at: https://build.nvidia.com\n\n"
        f"**Current cluster state:**\n"
        f"- {len(incidents)} total incidents, {len(active)} active\n"
        f"- {len(attack_paths)} attack path(s) detected\n"
        f"- {len(nodes)} nodes in topology graph"
    )