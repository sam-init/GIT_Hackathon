import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  p: ({ children }) => (
    <p style={{ margin: "0 0 8px 0", lineHeight: 1.7, color: "#CBD5E1" }}>{children}</p>
  ),
  strong: ({ children }) => (
    <strong style={{ color: "#E2E8F0", fontWeight: 700 }}>{children}</strong>
  ),
  ul: ({ children }) => (
    <ul style={{ margin: "4px 0 10px 0", paddingLeft: 18 }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: "4px 0 10px 0", paddingLeft: 18 }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: 4, color: "#CBD5E1", lineHeight: 1.6 }}>{children}</li>
  ),
  h1: ({ children }) => (
    <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", margin: "10px 0 6px" }}>{children}</div>
  ),
  h2: ({ children }) => (
    <div style={{ fontSize: 12, fontWeight: 700, color: "#E2E8F0", margin: "8px 0 5px" }}>{children}</div>
  ),
  h3: ({ children }) => (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: "#64748B",
        margin: "7px 0 4px",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
      }}
    >
      {children}
    </div>
  ),
  code: ({ className, children }) =>
    className ? (
      <pre
        style={{
          background: "#0B1020",
          border: "1px solid #1E293B",
          borderRadius: 6,
          padding: "10px 14px",
          margin: "8px 0",
          overflowX: "auto",
          fontSize: 11,
        }}
      >
        <code style={{ color: "#94A3B8", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "pre" }}>
          {children}
        </code>
      </pre>
    ) : (
      <code
        style={{
          background: "rgba(56,189,248,0.08)",
          color: "#38BDF8",
          padding: "1px 5px",
          borderRadius: 3,
          fontSize: "0.88em",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {children}
      </code>
    ),
  blockquote: ({ children }) => (
    <blockquote
      style={{
        borderLeft: "2px solid #334155",
        paddingLeft: 10,
        margin: "6px 0",
        color: "#64748B",
        fontStyle: "italic",
      }}
    >
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div style={{ overflowX: "auto", margin: "8px 0" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th
      style={{
        border: "1px solid #1E293B",
        padding: "4px 10px",
        background: "#111827",
        color: "#94A3B8",
        fontWeight: 700,
        textAlign: "left",
        fontSize: 10,
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td style={{ border: "1px solid #1E293B", padding: "4px 10px", color: "#CBD5E1" }}>{children}</td>
  ),
};

export function AIStyledMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}

