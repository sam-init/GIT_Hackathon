"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chatWithCopilot } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message { role: "user" | "assistant"; content: string; }

const SUGGESTIONS = [
  "Why is auth-service crashing?",
  "Show impacted services",
  "Explain the attack path",
  "What changed before the incident?",
  "How do I fix the Redis outage?",
];

// Markdown overrides — dark theme, enterprise feel
const mdComponents = {
  p: ({ children }: any) => (
    <p style={{ margin: "0 0 8px 0", lineHeight: 1.7 }}>{children}</p>
  ),
  strong: ({ children }: any) => (
    <strong style={{ color: "#E2E8F0", fontWeight: 700 }}>{children}</strong>
  ),
  ul: ({ children }: any) => (
    <ul style={{ margin: "4px 0 10px 0", paddingLeft: 16 }}>{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol style={{ margin: "4px 0 10px 0", paddingLeft: 16 }}>{children}</ol>
  ),
  li: ({ children }: any) => (
    <li style={{ marginBottom: 4, color: "#CBD5E1", lineHeight: 1.6 }}>{children}</li>
  ),
  h1: ({ children }: any) => (
    <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 6, marginTop: 10 }}>{children}</div>
  ),
  h2: ({ children }: any) => (
    <div style={{ fontSize: 12, fontWeight: 700, color: "#E2E8F0", marginBottom: 5, marginTop: 8 }}>{children}</div>
  ),
  h3: ({ children }: any) => (
    <div style={{
      fontSize: 10, fontWeight: 700, color: "#64748B", marginBottom: 4, marginTop: 7,
      textTransform: "uppercase", letterSpacing: "0.07em",
    }}>{children}</div>
  ),
  code: ({ inline, children }: any) =>
    inline ? (
      <code style={{
        background: "rgba(56,189,248,0.08)", color: "#38BDF8",
        padding: "1px 5px", borderRadius: 3, fontSize: "0.88em",
        fontFamily: "'JetBrains Mono', monospace",
      }}>{children}</code>
    ) : (
      <pre style={{
        background: "#0B1020", border: "1px solid #1E293B",
        borderRadius: 6, padding: "10px 14px", margin: "8px 0",
        overflowX: "auto", fontSize: 11,
      }}>
        <code style={{ color: "#94A3B8", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "pre" }}>
          {children}
        </code>
      </pre>
    ),
  blockquote: ({ children }: any) => (
    <blockquote style={{
      borderLeft: "2px solid #334155", paddingLeft: 10,
      margin: "6px 0", color: "#64748B", fontStyle: "italic",
    }}>{children}</blockquote>
  ),
  table: ({ children }: any) => (
    <div style={{ overflowX: "auto", margin: "8px 0" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>{children}</table>
    </div>
  ),
  th: ({ children }: any) => (
    <th style={{
      border: "1px solid #1E293B", padding: "4px 10px",
      background: "#111827", color: "#94A3B8", fontWeight: 700, textAlign: "left", fontSize: 10,
    }}>{children}</th>
  ),
  td: ({ children }: any) => (
    <td style={{ border: "1px solid #1E293B", padding: "4px 10px", color: "#CBD5E1" }}>{children}</td>
  ),
};

// TypingDots — intentional, functional animation
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
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "⚠ Backend unreachable. Start the API server.",
      }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{
        padding: "11px 16px",
        borderBottom: "1px solid #1E293B",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <div style={{
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
        }}>◎</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#E2E8F0", lineHeight: 1.2 }}>AI Copilot</div>
          <div style={{ fontSize: 9, color: "#475569", marginTop: 1 }}>Cluster-aware · Graph-native</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 9, color: "#334155", fontFamily: "'JetBrains Mono', monospace" }}>
          llama-3.3-70b
        </div>
      </div>

      {/* Messages */}
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
              {/* Role label */}
              <div style={{
                fontSize: 9,
                color: "#334155",
                marginBottom: 3,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}>
                {msg.role === "assistant" ? "Copilot" : "You"}
              </div>

              {/* Bubble */}
              <div style={{
                maxWidth: "92%",
                padding: "9px 13px",
                borderRadius: msg.role === "user" ? "10px 10px 3px 10px" : "3px 10px 10px 10px",
                background: msg.role === "user"
                  ? "rgba(56,189,248,0.08)"
                  : "#111827",
                border: msg.role === "user"
                  ? "1px solid rgba(56,189,248,0.2)"
                  : "1px solid #1E293B",
                fontSize: 12,
                color: "#CBD5E1",
                lineHeight: 1.65,
              }}>
                {msg.role === "assistant" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={mdComponents as any}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <span>{msg.content}</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && <TypingDots />}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips — only on fresh state */}
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

      {/* Input area */}
      <div style={{ padding: "10px 12px", borderTop: "1px solid #1E293B" }}>
        <div style={{ display: "flex", gap: 7 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about your cluster…"
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
            onFocus={(e) => { e.target.style.borderColor = "rgba(56,189,248,0.35)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#1E293B"; }}
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
