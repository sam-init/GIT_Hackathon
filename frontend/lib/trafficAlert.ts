import { API } from "@/lib/api";

const WINDOW_MS = Number(process.env.DDOS_WINDOW_MS ?? "10000");
const REQUEST_THRESHOLD = Number(process.env.DDOS_REQUEST_THRESHOLD ?? "60");
const ALERT_COOLDOWN_MS = Number(process.env.DDOS_ALERT_COOLDOWN_MS ?? "120000");

const recentRequests: number[] = [];
let lastAlertAt = 0;
let alertInFlight = false;

function pruneOldRequests(now: number) {
  while (recentRequests.length > 0 && now - recentRequests[0] > WINDOW_MS) {
    recentRequests.shift();
  }
}

export async function monitorHomepageRequestFlood() {
  if (WINDOW_MS <= 0 || REQUEST_THRESHOLD <= 0) {
    return;
  }

  const now = Date.now();
  recentRequests.push(now);
  pruneOldRequests(now);

  if (recentRequests.length < REQUEST_THRESHOLD) {
    return;
  }

  if (alertInFlight || now - lastAlertAt < ALERT_COOLDOWN_MS) {
    return;
  }

  alertInFlight = true;

  try {
    const reqCount = recentRequests.length;
    const windowSec = Math.max(1, Math.round(WINDOW_MS / 1000));
    const approxRps = (reqCount / (WINDOW_MS / 1000)).toFixed(1);

    const response = await fetch(`${API}/telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service: "frontend",
        status: "TrafficSpike",
        restart_count: 0,
        recent_deployment: false,
        logs_summary: `Potential request flood on /: ${reqCount} requests in ${windowSec}s (~${approxRps} req/s).`,
        namespace: "default",
        node_id: "frontend",
      }),
      cache: "no-store",
    });

    if (response.ok) {
      lastAlertAt = now;
    }
  } catch {
    // Non-blocking detector: ignore failures so page render path stays healthy.
  } finally {
    alertInFlight = false;
  }
}
