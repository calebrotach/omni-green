import type { CSSProperties } from "react";
import { useState } from "react";
import { PhaseColorLegend } from "@/components/PhaseColorLegend";
import { SwimlaneFlow } from "@/components/SwimlaneFlow";
import {
  END_TO_END_GRAPH,
  LIFECYCLE_GRAPH,
  SINGLE_ORDER_TRACE_GRAPH,
} from "@/data/swimlanePresentation";
import { useAppStore } from "@/store/useAppStore";

export function FlowPage() {
  const presentationComments = useAppStore((s) => s.presentationComments);
  const addPresentationComment = useAppStore((s) => s.addPresentationComment);
  const removePresentationComment = useAppStore(
    (s) => s.removePresentationComment,
  );

  const [author, setAuthor] = useState("");
  const [draft, setDraft] = useState("");

  const sorted = [...presentationComments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div style={{ maxWidth: "100%" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: "0 0 0.35rem", fontSize: "clamp(1.35rem, 2.5vw, 1.75rem)" }}>
          Trade execution flow
        </h1>
        <p style={{ margin: 0, color: "var(--muted)", maxWidth: "72ch", lineHeight: 1.55 }}>
          Swimlane views for evergreen / private-wealth style programs custodied at{" "}
          <strong>UMB</strong>, US mutual-fund omnibus mechanics, and{" "}
          <strong>OmniGreen</strong> as allocator. Follow <strong>one order</strong> below from
          subaccount instruction through omnibus street and <strong>back to subaccount</strong>{" "}
          economics; the other charts summarize batch-level and stage-level views.
        </p>
        <div style={{ marginTop: "1rem", maxWidth: 900 }}>
          <PhaseColorLegend />
        </div>
      </header>

      <section>
        <h2 style={diagramTitle}>Single order: creation → settlement (state trace)</h2>
        <p style={diagramCaption}>
          One instruction, one path. Boxes name the <strong>representation of that order</strong>{" "}
          (subaccount vs omnibus); link labels are <strong>transforms or handoffs</strong>. The same
          logical order is subaccount-native at OmniGreen, becomes <strong>omnibus-only</strong> to
          UMB and the fund, then returns through <strong>allocation</strong> to subaccount settled
          state for the client API and dashboard.
        </p>
        <SwimlaneFlow spec={SINGLE_ORDER_TRACE_GRAPH} />
      </section>

      <section style={{ marginTop: "2.75rem" }}>
        <h2 style={diagramTitle}>End-to-end swimlanes (batch view)</h2>
        <p style={diagramCaption}>
          <strong>Arrows</strong> show what happens next; <strong>labeled links</strong> are handoffs
          between parties (files, wire, street execution, settlement). Time moves left → right within a
          phase column, then continues into the next column when work shifts to settlement / books.
        </p>
        <SwimlaneFlow spec={END_TO_END_GRAPH} />
      </section>

      <section style={{ marginTop: "2.75rem" }}>
        <h2 style={diagramTitle}>Lifecycle summary (stages)</h2>
        <p style={diagramCaption}>
          Same idea: follow arrows from orders through trades, fund, and settled state.
        </p>
        <SwimlaneFlow spec={LIFECYCLE_GRAPH} />
      </section>

      <section
        style={{
          marginTop: "3rem",
          paddingTop: "1.75rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.15rem" }}>
          Comments &amp; conversation
        </h2>
        <p style={{ margin: "0 0 1rem", color: "var(--muted)", fontSize: "0.9rem", maxWidth: "62ch" }}>
          Notes for you and your CPO during walkthroughs. Stored in this browser (and in{" "}
          <strong>Export JSON</strong> if you share a snapshot).
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.65rem",
            marginBottom: "1.25rem",
            maxWidth: 640,
          }}
        >
          <input
            placeholder="Your name (optional)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            style={inputStyle}
            autoComplete="name"
          />
          <textarea
            placeholder="Add a comment or question…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            style={{ ...inputStyle, minHeight: 88, resize: "vertical" }}
          />
          <button
            type="button"
            className="btn-primary"
            style={{ alignSelf: "flex-start" }}
            onClick={() => {
              addPresentationComment(author, draft);
              setDraft("");
            }}
          >
            Post comment
          </button>
        </div>

        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {sorted.length === 0 ? (
            <li style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              No comments yet.
            </li>
          ) : (
            sorted.map((c) => (
              <li
                key={c.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "0.85rem 1rem",
                  marginBottom: "0.65rem",
                  background: "var(--bg-elevated)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "baseline",
                    gap: "0.5rem",
                    marginBottom: "0.35rem",
                  }}
                >
                  <strong style={{ fontSize: "0.9rem" }}>{c.author}</strong>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{
                      marginLeft: "auto",
                      fontSize: "0.75rem",
                      padding: "0.2rem 0.5rem",
                    }}
                    onClick={() => removePresentationComment(c.id)}
                  >
                    Remove
                  </button>
                </div>
                <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                  {c.body}
                </p>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

const diagramTitle: CSSProperties = {
  margin: "0 0 0.35rem",
  fontSize: "1.05rem",
  fontWeight: 600,
};

const diagramCaption: CSSProperties = {
  margin: "0 0 0.85rem",
  fontSize: "0.88rem",
  color: "var(--muted)",
  maxWidth: "70ch",
  lineHeight: 1.5,
};

const inputStyle: CSSProperties = {
  padding: "0.55rem 0.65rem",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--bg)",
  color: "var(--text)",
};
