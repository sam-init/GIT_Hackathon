"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chatWithCopilot } from "@/lib/api";

interface Message { role: "user" | "assistant"; content: string; }

const SUGGESTIONS = [
  "Why is auth-service crashing?",
  "Show impacted services",
  "Explain the attack path",
  "What changed before the incident?",
  "How do I fix the Redis outage?",
];

export function AICopilot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Ask me anything",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(msg?: string) {
    const text = msg || input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await chatWithCopilot(text, history);
      setMessages(prev => [...prev, { role: "assistant", content: res.response }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Backend unreachable. Start the API server." }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px", borderBottom: "1px solid #1e2d45",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, boxShadow: "0 0 12px rgba(6,182,212,0.4)",
        }}>🤖</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>AI Copilot</div>
          <div style={{ fontSize: 10, color: "#06b6d4" }}>● Infrastructure-aware · Graph-native</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 0" }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                marginBottom: 14,
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {msg.role === "assistant" && (
                <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg,#06b6d4,#8b5cf6)", flexShrink: 0, marginRight: 8, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                  🤖
                </div>
              )}
              <div style={{
                maxWidth: "82%",
                padding: "10px 14px",
                borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.15))"
                  : "rgba(17,24,39,0.8)",
                border: msg.role === "user"
                  ? "1px solid rgba(6,182,212,0.3)"
                  : "1px solid #1e2d45",
                fontSize: 12,
                color: "#e2e8f0",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", gap: 6, padding: "4px 0 14px 32px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#06b6d4", animation: `float ${0.6 + i * 0.2}s ease-in-out infinite` }} />
            ))}
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{ padding: "8px 16px", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => send(s)} style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 10, cursor: "pointer",
              background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)",
              color: "#06b6d4", fontWeight: 500, transition: "all 0.2s",
            }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #1e2d45" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask about your cluster..."
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 8, fontSize: 12,
              background: "rgba(17,24,39,0.8)", border: "1px solid #1e2d45",
              color: "#e2e8f0", outline: "none", transition: "border 0.2s",
            }}
            onFocus={e => (e.target.style.borderColor = "#06b6d4")}
            onBlur={e => (e.target.style.borderColor = "#1e2d45")}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{
            padding: "10px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
            background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
            border: "none", color: "white", opacity: loading || !input.trim() ? 0.5 : 1,
            transition: "opacity 0.2s",
          }}>
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
