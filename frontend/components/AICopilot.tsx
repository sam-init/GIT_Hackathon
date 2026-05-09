"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { chatWithCopilot } from "@/lib/api";
import { AIStyledMarkdown } from "@/components/AIStyledMarkdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Why is auth-service crashing?",
  "Show impacted services",
  "Explain the attack path",
  "What changed before the incident?",
  "How do I fix the Redis outage?",
];

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "8px 0", alignItems: "center" }}>
      <span style={{ fontSize: 9, color: "#334155", marginRight: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Copilot
      </span>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#38BDF8",
            animation: `typing-dot 1.2s ${i * 0.2}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function AICopilot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Ask me anything about your cluster." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(msg?: string) {
    const text = msg || input.trim();
    if (!text || loading) return;

    setInput("");
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await chatWithCopilot(text, history);
      setMessages((prev) => [...prev, { role: "assistant", content: res.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠ Backend unreachable. Start the API server." },
      ]);
    }

    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "11px 16px", borderBottom: "1px solid #1E293B", display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "rgba(56,189,248,0.1)",
            border: "1px solid rgba(56,189,248,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            color: "#38BDF8",
            flexShrink: 0,
          }}
        >
          ◎
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#E2E8F0", lineHeight: 1.2 }}>AI Copilot</div>
          <div style={{ fontSize: 9, color: "#475569", marginTop: 1 }}>Cluster-aware · Graph-native</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 0" }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              style={{
                marginBottom: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  color: "#334155",
                  marginBottom: 4,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {msg.role === "assistant" ? "Copilot" : "You"}
              </div>

              <div
                style={{
                  maxWidth: "92%",
                  padding: msg.role === "assistant" ? "10px 14px" : "9px 13px",
                  borderRadius: msg.role === "user" ? "10px 10px 3px 10px" : "3px 10px 10px 10px",
                  background: msg.role === "user" ? "rgba(56,189,248,0.08)" : "#111827",
                  border: msg.role === "user" ? "1px solid rgba(56,189,248,0.2)" : "1px solid #1E293B",
                  fontSize: 12,
                  color: "#CBD5E1",
                  lineHeight: 1.65,
                }}
              >
                {msg.role === "assistant" ? <AIStyledMarkdown content={msg.content} /> : <span>{msg.content}</span>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && <TypingDots />}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div style={{ padding: "6px 12px", display: "flex", gap: 4, flexWrap: "wrap" }}>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              style={{
                padding: "4px 9px",
                borderRadius: 5,
                fontSize: 10,
                cursor: "pointer",
                background: "transparent",
                border: "1px solid #1E293B",
                color: "#475569",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(56,189,248,0.25)";
                e.currentTarget.style.color = "#38BDF8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#1E293B";
                e.currentTarget.style.color = "#475569";
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: "10px 12px", borderTop: "1px solid #1E293B" }}>
        <div style={{ display: "flex", gap: 7 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about your cluster..."
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 7,
              fontSize: 12,
              background: "#0F172A",
              border: "1px solid #1E293B",
              color: "#E2E8F0",
              outline: "none",
              transition: "border-color 0.15s",
              fontFamily: "inherit",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(56,189,248,0.35)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#1E293B";
            }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              padding: "8px 14px",
              borderRadius: 7,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              background: "#38BDF8",
              border: "none",
              color: "#0F172A",
              opacity: loading || !input.trim() ? 0.35 : 1,
              transition: "opacity 0.15s",
              fontFamily: "inherit",
              lineHeight: 1,
            }}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

