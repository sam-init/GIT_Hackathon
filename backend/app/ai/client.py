import os
import httpx
from typing import Optional

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "")
NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
NVIDIA_MODEL = os.getenv("NVIDIA_MODEL", "meta/llama-3.1-70b-instruct")


async def call_llm(prompt: str, system: str, max_tokens: int = 1024) -> str:
    if not NVIDIA_API_KEY:
        return _mock_llm_response(prompt)
    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": NVIDIA_MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": max_tokens,
        "temperature": 0.3,
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(f"{NVIDIA_BASE_URL}/chat/completions", json=payload, headers=headers)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


def _mock_llm_response(prompt: str) -> str:
    return (
        "AI analysis completed. Based on the infrastructure context provided, "
        "the most likely root cause is a cascading dependency failure originating "
        "from the affected service. Recommend immediate rollback and connection pool inspection. "
        "(Note: Set NVIDIA_API_KEY in .env for live AI responses)"
    )
