import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { buildBodyForNewRequirement } from "@/lib/requirementBody";
import { REQUIREMENT_PHASES_ORDER } from "@/lib/phaseColors";
import { extractFreeTextOutsideFlowMarkers } from "@/lib/requirementText";
import { statusesList } from "@/store/useAppStore";
import type { FlowNode, Requirement, RequirementPhase, RequirementStatus } from "@/types";

type Mode = { type: "create"; defaultFlowIds: string[] } | { type: "edit"; id: string };

type Props = {
  mode: Mode | null;
  onClose: () => void;
  flowNodes: FlowNode[];
  requirements: Requirement[];
  requirementCategories: string[];
  onSaveCreate: (r: Omit<Requirement, "id"> & { id?: string }) => void;
  onSaveEdit: (id: string, patch: Partial<Requirement>) => void;
};

export function RequirementEditModal({
  mode,
  onClose,
  flowNodes,
  requirements,
  requirementCategories,
  onSaveCreate,
  onSaveEdit,
}: Props) {
  const [title, setTitle] = useState("");
  const [phase, setPhase] = useState<RequirementPhase>("Order intake");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<RequirementStatus>("draft");
  const [bodyExtra, setBodyExtra] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [cpoNotes, setCpoNotes] = useState("");
  const [linkedIds, setLinkedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!mode) return;
    if (mode.type === "create") {
      setTitle("");
      setPhase("Order intake");
      setCategory(requirementCategories[0] ?? "");
      setStatus("draft");
      setBodyExtra("");
      setClientNotes("");
      setCpoNotes("");
      setLinkedIds([...mode.defaultFlowIds]);
      return;
    }
    const r = requirements.find((x) => x.id === mode.id);
    if (!r) return;
    setTitle(r.title);
    setPhase(r.phase);
    setCategory(r.category);
    setStatus(r.status);
    setBodyExtra(extractFreeTextOutsideFlowMarkers(r.body));
    setClientNotes(r.clientNotes);
    setCpoNotes(r.cpoNotes);
    setLinkedIds([...r.linkedFlowNodeIds]);
  }, [mode, requirements, requirementCategories]);

  if (!mode) return null;

  const handleSave = () => {
    const t = title.trim();
    if (!t) return;
    if (mode.type === "create") {
      onSaveCreate({
        category: category || requirementCategories[0] || "General",
        phase,
        title: t,
        body: buildBodyForNewRequirement(flowNodes, linkedIds, bodyExtra),
        status,
        clientNotes,
        cpoNotes,
        linkedFlowNodeIds: linkedIds,
      });
    } else {
      onSaveEdit(mode.id, {
        title: t,
        phase,
        category: category || requirementCategories[0] || "General",
        status,
        body: buildBodyForNewRequirement(flowNodes, linkedIds, bodyExtra),
        clientNotes,
        cpoNotes,
        linkedFlowNodeIds: linkedIds,
      });
    }
    onClose();
  };

  const toggleLink = (id: string) => {
    setLinkedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="req-modal-title"
      style={overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={panel}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <h2 id="req-modal-title" style={{ margin: 0, fontSize: "1.15rem" }}>
            {mode.type === "create" ? "New requirement" : "Edit requirement"}
          </h2>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <div style={grid}>
          <label style={lbl}>
            Title
            <input
              style={inputStyle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label style={lbl}>
            Status
            <select
              style={selectStyle}
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as RequirementStatus)
              }
            >
              {statusesList().map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label style={lbl}>
            Phase
            <select
              style={selectStyle}
              value={phase}
              onChange={(e) =>
                setPhase(e.target.value as RequirementPhase)
              }
            >
              {REQUIREMENT_PHASES_ORDER.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label style={lbl}>
            Category
            <select
              style={selectStyle}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {requirementCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset
          style={{
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "0.65rem 0.75rem",
            margin: "0.75rem 0 0",
          }}
        >
          <legend style={{ fontSize: "0.75rem", color: "var(--muted)", padding: "0 0.35rem" }}>
            Linked flow steps (page 1 diagram metadata — syncs into body markers)
          </legend>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            {flowNodes.map((n) => (
              <label
                key={n.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={linkedIds.includes(n.id)}
                  onChange={() => toggleLink(n.id)}
                />
                <span>
                  <strong style={{ fontWeight: 600 }}>{n.title}</strong>
                  <span style={{ color: "var(--muted)", display: "block", fontSize: "0.78rem" }}>
                    {n.phase} · {n.timingNote}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label style={{ ...lbl, marginTop: "0.85rem" }}>
          Requirement detail (additional text; flow blocks are rebuilt from checkboxes above on save)
          <textarea
            style={{ ...inputStyle, minHeight: 120 }}
            value={bodyExtra}
            onChange={(e) => setBodyExtra(e.target.value)}
          />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
          <label style={lbl}>
            Client notes
            <textarea
              style={{ ...inputStyle, minHeight: 88 }}
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
            />
          </label>
          <label style={lbl}>
            CPO notes
            <textarea
              style={{ ...inputStyle, minHeight: 88 }}
              value={cpoNotes}
              onChange={(e) => setCpoNotes(e.target.value)}
            />
          </label>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginTop: "1rem",
            justifyContent: "flex-end",
          }}
        >
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  zIndex: 2000,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: "2rem 1rem",
  overflowY: "auto",
};

const panel: CSSProperties = {
  width: "100%",
  maxWidth: 720,
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "1.25rem",
  boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
};

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "0.65rem",
};

const inputStyle: CSSProperties = {
  padding: "0.45rem 0.55rem",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--bg)",
  color: "var(--text)",
};

const selectStyle = { ...inputStyle } as const;

const lbl: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontSize: "0.75rem",
  color: "var(--muted)",
};
