import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { PhaseQuickReference } from "@/components/PhaseQuickReference";
import { RequirementEditModal } from "@/components/RequirementEditModal";
import {
  buildClickUpBundle,
  buildClickUpCsv,
  buildClickUpMarkdown,
  downloadTextFile,
} from "@/lib/clickUpExport";
import { orderFlowNodes } from "@/lib/flowNodeOrder";
import { getPhaseTheme, REQUIREMENT_PHASES_ORDER } from "@/lib/phaseColors";
import { requirementPreview } from "@/lib/requirementText";
import { useAppStore } from "@/store/useAppStore";
import type { Requirement, RequirementPhase, RequirementStatus } from "@/types";

type ModalMode =
  | { type: "create"; defaultFlowIds: string[] }
  | { type: "edit"; id: string }
  | null;

export function RequirementsPage() {
  const requirements = useAppStore((s) => s.requirements);
  const flowNodes = useAppStore((s) => s.flowNodes);
  const flowEdges = useAppStore((s) => s.flowEdges);
  const updateRequirement = useAppStore((s) => s.updateRequirement);
  const addRequirement = useAppStore((s) => s.addRequirement);
  const addRequirementCategory = useAppStore((s) => s.addRequirementCategory);
  const requirementCategories = useAppStore((s) => s.requirementCategories);

  const [phaseFilter, setPhaseFilter] = useState<RequirementPhase | "all">("all");
  const [newCategory, setNewCategory] = useState("");
  const [modal, setModal] = useState<ModalMode>(null);

  const orderedNodes = useMemo(
    () => orderFlowNodes(flowNodes, flowEdges),
    [flowNodes, flowEdges],
  );

  const visibleRequirements = useMemo(() => {
    if (phaseFilter === "all") return requirements;
    return requirements.filter((r) => r.phase === phaseFilter);
  }, [requirements, phaseFilter]);

  const nodesToShow = useMemo(() => {
    if (phaseFilter === "all") return orderedNodes;
    return orderedNodes.filter((n) => n.phase === phaseFilter);
  }, [orderedNodes, phaseFilter]);

  const reqsByFlowNodeId = useMemo(() => {
    const map = new Map<string, Requirement[]>();
    for (const r of visibleRequirements) {
      for (const fid of r.linkedFlowNodeIds) {
        const arr = map.get(fid) ?? [];
        arr.push(r);
        map.set(fid, arr);
      }
    }
    for (const [, arr] of map) {
      arr.sort((a, b) => a.title.localeCompare(b.title));
    }
    return map;
  }, [visibleRequirements]);

  const unassigned = useMemo(
    () =>
      visibleRequirements.filter(
        (r) =>
          r.linkedFlowNodeIds.length === 0 ||
          !r.linkedFlowNodeIds.some((id) => flowNodes.some((n) => n.id === id)),
      ),
    [visibleRequirements, flowNodes],
  );

  const exportSlug = () => new Date().toISOString().slice(0, 10);

  const handleExportJson = () => {
    const bundle = buildClickUpBundle(requirements, flowNodes);
    downloadTextFile(
      `omni-green-clickup-${exportSlug()}.json`,
      JSON.stringify(bundle, null, 2),
      "application/json",
    );
  };

  const handleExportCsv = () => {
    const bundle = buildClickUpBundle(requirements, flowNodes);
    downloadTextFile(
      `omni-green-clickup-${exportSlug()}.csv`,
      buildClickUpCsv(bundle),
      "text/csv;charset=utf-8",
    );
  };

  const handleExportMd = () => {
    const bundle = buildClickUpBundle(requirements, flowNodes);
    downloadTextFile(
      `omni-green-clickup-${exportSlug()}.md`,
      buildClickUpMarkdown(bundle),
      "text/markdown;charset=utf-8",
    );
  };

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Requirements by flow step</h1>
      <p style={{ color: "var(--muted)", maxWidth: "72ch", lineHeight: 1.55, marginBottom: "0.65rem" }}>
        Grouped under each <strong>execution-flow step</strong> (same sequence as{" "}
        <strong>Trade execution flow</strong>). Rows are summaries; <strong>Edit</strong> opens full
        text, client/CPO notes, and linked steps. <strong>Phase filter</strong> limits by timeline
        phase. <strong>ClickUp exports</strong> (JSON, CSV, Markdown) map to an epic plus stories.
      </p>

      <PhaseQuickReference />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          margin: "0 0 1.25rem",
          alignItems: "flex-end",
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Phase filter</span>
          <select
            value={phaseFilter}
            onChange={(e) =>
              setPhaseFilter(e.target.value as RequirementPhase | "all")
            }
            style={selectStyle}
          >
            <option value="all">All phases</option>
            {REQUIREMENT_PHASES_ORDER.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <div style={{ display: "flex", gap: 8, flex: "1 1 220px" }}>
          <input
            placeholder="New requirement category…"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              const t = newCategory.trim();
              if (!t) return;
              addRequirementCategory(t);
              setNewCategory("");
            }}
          >
            Add category
          </button>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setModal({ type: "create", defaultFlowIds: [] })}
        >
          New requirement
        </button>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <button type="button" className="btn-ghost" onClick={handleExportJson}>
            ClickUp JSON
          </button>
          <button type="button" className="btn-ghost" onClick={handleExportCsv}>
            ClickUp CSV
          </button>
          <button type="button" className="btn-ghost" onClick={handleExportMd}>
            ClickUp Markdown
          </button>
        </div>
      </div>

      <RequirementEditModal
        mode={modal}
        onClose={() => setModal(null)}
        flowNodes={flowNodes}
        requirements={requirements}
        requirementCategories={requirementCategories}
        onSaveCreate={(r) => addRequirement(r)}
        onSaveEdit={(id, patch) => updateRequirement(id, patch)}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {nodesToShow.map((node) => {
          const linked = reqsByFlowNodeId.get(node.id) ?? [];
          const phaseTheme = getPhaseTheme(node.phase);
          return (
            <section
              key={node.id}
              style={{
                border: "1px solid var(--border)",
                borderLeft: `4px solid ${phaseTheme.accent}`,
                borderRadius: 12,
                overflow: "hidden",
                background: "var(--bg-elevated)",
              }}
            >
              <div
                style={{
                  padding: "0.85rem 1rem",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "0.65rem",
                  background: `linear-gradient(90deg, ${phaseTheme.darkPanelTint} 0%, var(--bg) 42%)`,
                }}
              >
                <div style={{ flex: "1 1 240px" }}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "1rem",
                      fontWeight: 700,
                      letterSpacing: "-0.01em",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: phaseTheme.accent,
                        flexShrink: 0,
                      }}
                    />
                    {node.title}
                  </h2>
                  <p style={{ margin: "0.35rem 0 0", fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.45 }}>
                    <strong style={{ color: phaseTheme.accent, fontWeight: 600 }}>{node.phase}</strong>
                    {" · "}
                    {node.timingNote}
                  </p>
                  <p style={{ margin: "0.35rem 0 0", fontSize: "0.78rem", color: "var(--muted)" }}>
                    {node.actor} · {node.systemOrChannel}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ flexShrink: 0, fontSize: "0.82rem" }}
                  onClick={() =>
                    setModal({ type: "create", defaultFlowIds: [node.id] })
                  }
                >
                  + Add requirement
                </button>
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {linked.length === 0 ? (
                  <li
                    style={{
                      padding: "0.75rem 1rem",
                      color: "var(--muted)",
                      fontSize: "0.88rem",
                    }}
                  >
                    No requirements linked to this step
                    {phaseFilter !== "all" ? " in the current phase filter" : ""}.
                  </li>
                ) : (
                  linked.map((r) => (
                    <CompactRequirementRow
                      key={r.id}
                      requirement={r}
                      onEdit={() => setModal({ type: "edit", id: r.id })}
                    />
                  ))
                )}
              </ul>
            </section>
          );
        })}

        {unassigned.length > 0 ? (
          <section
            style={{
              border: "1px dashed var(--border)",
              borderRadius: 12,
              overflow: "hidden",
              background: "var(--bg-elevated)",
            }}
          >
            <div
              style={{
                padding: "0.85rem 1rem",
                borderBottom: "1px solid var(--border)",
                background: "var(--bg)",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
                Not tied to a flow step
              </h2>
              <p style={{ margin: "0.35rem 0 0", fontSize: "0.82rem", color: "var(--muted)" }}>
                Link these in <strong>Edit</strong> to a diagram step, or leave as cross-cutting.
              </p>
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {unassigned.map((r) => (
                <CompactRequirementRow
                  key={r.id}
                  requirement={r}
                  onEdit={() => setModal({ type: "edit", id: r.id })}
                />
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function CompactRequirementRow({
  requirement: r,
  onEdit,
}: {
  requirement: Requirement;
  onEdit: () => void;
}) {
  const preview = requirementPreview(r.body, 160);
  const reqPhase = getPhaseTheme(r.phase);
  return (
    <li
      style={{
        borderTop: "1px solid var(--border)",
        padding: "0.65rem 1rem",
        paddingLeft: "0.85rem",
        borderLeft: `3px solid ${reqPhase.accent}`,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        gap: "0.65rem",
      }}
    >
      <div style={{ flex: "1 1 200px", minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "0.45rem",
            marginBottom: 4,
          }}
        >
          <span
            title={r.phase}
            aria-hidden
            style={{
              width: 7,
              height: 7,
              borderRadius: 2,
              background: reqPhase.accent,
              flexShrink: 0,
            }}
          />
          <StatusChip status={r.status} />
          <span style={{ fontWeight: 600, fontSize: "0.92rem" }}>{r.title}</span>
          <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>· {r.category}</span>
          <span style={{ fontSize: "0.78rem", color: reqPhase.accent }}>· {r.phase}</span>
        </div>
        {preview ? (
          <p
            style={{
              margin: 0,
              fontSize: "0.82rem",
              color: "var(--muted)",
              lineHeight: 1.45,
            }}
          >
            {preview}
          </p>
        ) : null}
        {r.lastSyncedAt ? (
          <p style={{ margin: "0.35rem 0 0", fontSize: "0.7rem", color: "var(--muted)" }}>
            Last flow metadata sync: {new Date(r.lastSyncedAt).toLocaleString()}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        className="btn-primary"
        style={{ fontSize: "0.82rem", padding: "0.35rem 0.75rem", flexShrink: 0 }}
        onClick={onEdit}
      >
        Edit
      </button>
    </li>
  );
}

function StatusChip({ status }: { status: RequirementStatus }) {
  return (
    <span
      style={{
        fontSize: "0.65rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "0.2rem 0.45rem",
        borderRadius: 6,
        border: "1px solid var(--border)",
        color: "var(--accent-dim)",
        background: "rgba(61, 214, 140, 0.08)",
      }}
    >
      {status}
    </span>
  );
}

const inputStyle: CSSProperties = {
  padding: "0.45rem 0.55rem",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--bg)",
  color: "var(--text)",
};

const selectStyle = { ...inputStyle } as const;
