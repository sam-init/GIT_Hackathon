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

// Markdown component overrides — styled for dark theme
const mdComponents = {
  p: ({ children }: any) => (
    <p style={{ margin: "0 0 8px 0", lineHeight: 1.65 }}>{children}</p>
  ),
  strong: ({ children }: any) => (
    <strong style={{ color: "#e2e8f0", fontWeight: 700 }}>{children}</strong>
  ),
  ul: ({ children }: any) => (
    <ul style={{ margin: "4px 0 8px 0", paddingLeft: 18 }}>{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol style={{ margin: "4px 0 8px 0", paddingLeft: 18 }}>{children}</ol>
  ),
  li: ({ children }: any) => (
    <li style={{ marginBottom: 3, color: "#cbd5e1", lineHeight: 1.55 }}>{children}</li>
  ),
  h1: ({ children }: any) => (
    <div style={{ fontSize: 13, fontWeight: 800, color: "#e2e8f0", marginBottom: 6, marginTop: 10 }}>{children}</div>
  ),
  h2: ({ children }: any) => (
    <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginBottom: 4, marginTop: 8 }}>{children}</div>
  ),
  h3: ({ children }: any) => (
    <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 4, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{children}</div>
  ),
  code: ({ inline, children }: any) =>
    inline ? (
      <code style={{
        background: "rgba(6,182,212,0.1)", color: "#06b6d4",
        padding: "1px 5px", borderRadius: 4, fontSize: "0.9em",
        fontFamily: "monospace",
      }}>{children}</code>
    ) : (
      <pre style={{
        background: "rgba(0,0,0,0.4)", border: "1px solid #1e2d45",
        borderRadius: 6, padding: "10px 12px", margin: "8px 0",
        overflowX: "auto", fontSize: 11,
      }}>
        <code style={{ color: "#a5f3fc", fontFamily: "monospace", whiteSpace: "pre" }}>{children}</code>
      </pre>
    ),
  blockquote: ({ children }: any) => (
    <blockquote style={{
      borderLeft: "3px solid #06b6d4", paddingLeft: 10,
      margin: "6px 0", color: "#94a3b8", fontStyle: "italic",
    }}>{children}</blockquote>
  ),
  table: ({ children }: any) => (
    <div style={{ overflowX: "auto", margin: "8px 0" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>{children}</table>
    </div>
  ),
  th: ({ children }: any) => (
    <th style={{ border: "1px solid #1e2d45", padding: "4px 8px", background: "rgba(6,182,212,0.1)", color: "#06b6d4", fontWeight: 700, textAlign: "left" }}>{children}</th>
  ),
  td: ({ children }: any) => (
    <td style={{ border: "1px solid #1e2d45", padding: "4px 8px", color: "#cbd5e1" }}>{children}</td>
  ),
};

export function AICopilot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Ask me anything" },
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
        padding: "14px 18px", borderBottom: "1px solid #1e2d45",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, boxShadow: "0 0 12px rgba(6,182,212,0.4)",
        }}>🤖</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>AI Copilot</div>
          <div style={{ fontSize: 10, color: "#06b6d4" }}>● Cluster-aware · Graph-native</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          llama-3.3-70b
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 0" }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                marginBottom: 14,
                display: "flex",
                flexDirection: "column",
                alignItems: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {/* Role label */}
              <div style={{
                fontSize: 9, color: "#334155", marginBottom: 3, fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.06em",
                paddingLeft: msg.role === "user" ? 0 : 2,
              }}>
                {msg.role === "assistant" ? "🤖 Copilot" : "You"}
              </div>

              <div style={{
                maxWidth: "90%",
                padding: "10px 14px",
                borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "4px 12px 12px 12px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(59,130,246,0.12))"
                  : "rgba(15,23,42,0.9)",
                border: msg.role === "user"
                  ? "1px solid rgba(6,182,212,0.25)"
                  : "1px solid #1e2d45",
                fontSize: 12,
                color: "#cbd5e1",
                lineHeight: 1.6,
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

        {/* Loading dots */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: "flex", gap: 5, padding: "4px 0 14px 4px", alignItems: "center" }}>
            <div style={{ fontSize: 9, color: "#334155", marginRight: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>🤖 Copilot</div>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 5, height: 5, borderRadius: "50%", background: "#06b6d4",
                animation: `float ${0.5 + i * 0.15}s ease-in-out infinite`,
              }} />
            ))}
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{ padding: "8px 14px", display: "flex", gap: 5, flexWrap: "wrap" }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => send(s)} style={{
              padding: "4px 9px", borderRadius: 6, fontSize: 10, cursor: "pointer",
              background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.18)",
              color: "#06b6d4", fontWeight: 500, transition: "all 0.2s",
            }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "10px 14px", borderTop: "1px solid #1e2d45" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask about your cluster..."
            style={{
              flex: 1, padding: "9px 12px", borderRadius: 8, fontSize: 12,
              background: "rgba(15,23,42,0.8)", border: "1px solid #1e2d45",
              color: "#e2e8f0", outline: "none", transition: "border 0.2s",
            }}
            onFocus={e => (e.target.style.borderColor = "#06b6d4")}
            onBlur={e => (e.target.style.borderColor = "#1e2d45")}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{
            padding: "9px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
            background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
            border: "none", color: "white", opacity: loading || !input.trim() ? 0.4 : 1,
            transition: "opacity 0.2s",
          }}>
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
