"use client";

import { useEffect } from "react";
import { API } from "@/lib/api";

interface RCAWarmupProps {
  pendingCount: number;
}

export function RCAWarmup({ pendingCount }: RCAWarmupProps) {
  useEffect(() => {
    if (pendingCount <= 0) return;

    const controller = new AbortController();
    const limit = Math.min(pendingCount, 50);
    const url = `${API}/incidents/analyze-active?limit=${limit}&concurrency=6`;

    fetch(url, {
      method: "POST",
      signal: controller.signal,
    }).catch(() => {
      // Best-effort warmup. Ignore failures to avoid affecting UI.
    });

    return () => controller.abort();
  }, [pendingCount]);

  return null;
}

