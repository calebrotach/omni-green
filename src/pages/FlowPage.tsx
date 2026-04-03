import type { CSSProperties } from "react";
import { MermaidChart } from "@/components/MermaidChart";
import { buildFlowchartMermaid, useAppStore } from "@/store/useAppStore";
import type { RequirementPhase } from "@/types";

export function FlowPage() {
  const flowNodes = useAppStore((s) => s.flowNodes);
  const flowEdges = useAppStore((s) => s.flowEdges);
  const selectedFlowNodeId = useAppStore((s) => s.selectedFlowNodeId);
  const setSelectedFlowNodeId = useAppStore((s) => s.setSelectedFlowNodeId);
  const updateFlowNode = useAppStore((s) => s.updateFlowNode);

  const selected = flowNodes.find((n) => n.id === selectedFlowNodeId) ?? null;
  const selectedMermaidId = selected?.mermaidId ?? null;

  const definition = buildFlowchartMermaid(
    flowNodes,
    flowEdges,
    selectedMermaidId,
  );

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Element 1 · Trade execution flow</h1>
      <p style={{ color: "var(--muted)", maxWidth: "65ch" }}>
        Model omnibus mutual-fund style flow for evergreen private-wealth
        programs custodied at UMB (pattern aligned with US omni trading and
        distributor file conventions such as{" "}
        <a
          href="https://www.stepstonegroup.com/what-we-do/solutions-services/private-wealth-solutions/"
          target="_blank"
          rel="noreferrer"
        >
          StepStone private wealth solutions
        </a>
        ). Company name in scope: <strong>OmniGreen</strong> (replace any legacy
        “Monark” references). Edit a step on the right — linked requirements in{" "}
        <strong>Element 2</strong> update automatically.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: "1.25rem",
          marginTop: "1.25rem",
          alignItems: "start",
        }}
      >
        <div>
          <MermaidChart definition={definition} />
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.75rem" }}>
            Select a step to highlight the diagram. Cutoff times follow the UMB
            thread (4:00 PM ET wire same day as import; order file cutoff
            pending 6:00 PM ET confirmation).
          </p>
        </div>

        <aside
          style={{
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "1rem",
            background: "var(--bg-elevated)",
            position: "sticky",
            top: "1rem",
          }}
        >
          <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Flow steps</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1rem" }}>
            {flowNodes.map((n) => (
              <li key={n.id} style={{ marginBottom: "0.35rem" }}>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedFlowNodeId(
                      selectedFlowNodeId === n.id ? null : n.id,
                    )
                  }
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "0.5rem 0.65rem",
                    borderRadius: 8,
                    border: `1px solid ${selectedFlowNodeId === n.id ? "var(--accent)" : "var(--border)"}`,
                    background:
                      selectedFlowNodeId === n.id ? "#1a2e24" : "var(--bg)",
                    color: "var(--text)",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                    {n.phase}
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {selected ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              <label style={labelStyle}>
                Title
                <input
                  style={inputStyle}
                  value={selected.title}
                  onChange={(e) =>
                    updateFlowNode(selected.id, { title: e.target.value })
                  }
                />
              </label>
              <label style={labelStyle}>
                Phase (timeline)
                <select
                  style={inputStyle}
                  value={selected.phase}
                  onChange={(e) =>
                    updateFlowNode(selected.id, {
                      phase: e.target.value as RequirementPhase,
                    })
                  }
                >
                  {[
                    "Order intake",
                    "Submission & files",
                    "Wire & funding",
                    "Confirmation & positions",
                    "Settlement & books",
                    "Client experience & API",
                    "Account structure & custody",
                  ].map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label style={labelStyle}>
                Summary (synced into requirements)
                <textarea
                  style={{ ...inputStyle, minHeight: 88, resize: "vertical" }}
                  value={selected.summary}
                  onChange={(e) =>
                    updateFlowNode(selected.id, { summary: e.target.value })
                  }
                />
              </label>
              <label style={labelStyle}>
                Timing / SLA note
                <textarea
                  style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
                  value={selected.timingNote}
                  onChange={(e) =>
                    updateFlowNode(selected.id, { timingNote: e.target.value })
                  }
                />
              </label>
              <label style={labelStyle}>
                Actor
                <input
                  style={inputStyle}
                  value={selected.actor}
                  onChange={(e) =>
                    updateFlowNode(selected.id, { actor: e.target.value })
                  }
                />
              </label>
              <label style={labelStyle}>
                System / channel
                <input
                  style={inputStyle}
                  value={selected.systemOrChannel}
                  onChange={(e) =>
                    updateFlowNode(selected.id, {
                      systemOrChannel: e.target.value,
                    })
                  }
                />
              </label>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0 }}>
                Linked requirement IDs:{" "}
                {selected.linkedRequirementIds.length
                  ? selected.linkedRequirementIds.join(", ")
                  : "none"}
              </p>
            </div>
          ) : (
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
              Select a step to edit. Updates merge into requirement bodies for
              linked items.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

const labelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  fontSize: "0.75rem",
  color: "var(--muted)",
};

const inputStyle: CSSProperties = {
  padding: "0.45rem 0.55rem",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--bg)",
  color: "var(--text)",
};
