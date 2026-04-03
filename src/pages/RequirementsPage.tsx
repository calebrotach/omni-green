import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { buildBodyForNewRequirement } from "@/lib/requirementBody";
import {
  statusesList,
  useAppStore,
} from "@/store/useAppStore";
import type { RequirementPhase, RequirementStatus } from "@/types";

const PHASES: RequirementPhase[] = [
  "Order intake",
  "Submission & files",
  "Wire & funding",
  "Confirmation & positions",
  "Settlement & books",
  "Client experience & API",
  "Account structure & custody",
];

export function RequirementsPage() {
  const requirements = useAppStore((s) => s.requirements);
  const updateRequirement = useAppStore((s) => s.updateRequirement);
  const addRequirement = useAppStore((s) => s.addRequirement);
  const addRequirementCategory = useAppStore((s) => s.addRequirementCategory);
  const requirementCategories = useAppStore((s) => s.requirementCategories);
  const flowNodes = useAppStore((s) => s.flowNodes);

  const [phaseFilter, setPhaseFilter] = useState<RequirementPhase | "all">(
    "all",
  );
  const [newCategory, setNewCategory] = useState("");

  const [draftOpen, setDraftOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftPhase, setDraftPhase] = useState<RequirementPhase>("Order intake");
  const [draftCategory, setDraftCategory] = useState(requirementCategories[0] ?? "");
  const [draftBody, setDraftBody] = useState("");
  const [draftLinks, setDraftLinks] = useState<string[]>([]);

  const grouped = useMemo(() => {
    const list =
      phaseFilter === "all"
        ? requirements
        : requirements.filter((r) => r.phase === phaseFilter);
    const map = new Map<RequirementPhase, typeof requirements>();
    for (const r of list) {
      const arr = map.get(r.phase) ?? [];
      arr.push(r);
      map.set(r.phase, arr);
    }
    return map;
  }, [requirements, phaseFilter]);

  const phasesToShow =
    phaseFilter === "all" ? PHASES : ([phaseFilter] as RequirementPhase[]);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Requirements by timeline</h1>
      <p style={{ color: "var(--muted)", maxWidth: "65ch" }}>
        Requirements roll up to phases (order intake through books). Client and
        CPO notes support collaboration; statuses track decision maturity. Flow
        edits on the trade execution flow page rewrite the highlighted “From execution flow” blocks
        here. When you identify a new category (e.g., a new control theme), add
        it below — it becomes available on every requirement card.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          margin: "1rem 0",
          alignItems: "flex-end",
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
            Phase filter
          </span>
          <select
            value={phaseFilter}
            onChange={(e) =>
              setPhaseFilter(e.target.value as RequirementPhase | "all")
            }
            style={selectStyle}
          >
            <option value="all">All phases</option>
            {PHASES.map((p) => (
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
          onClick={() => setDraftOpen((v) => !v)}
        >
          {draftOpen ? "Close new requirement" : "New requirement"}
        </button>
      </div>

      {draftOpen ? (
        <section
          style={{
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "1rem",
            marginBottom: "1.25rem",
            background: "var(--bg-elevated)",
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>New requirement</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "0.65rem",
            }}
          >
            <label style={lbl}>
              Title
              <input
                style={inputStyle}
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
              />
            </label>
            <label style={lbl}>
              Phase
              <select
                style={selectStyle}
                value={draftPhase}
                onChange={(e) =>
                  setDraftPhase(e.target.value as RequirementPhase)
                }
              >
                {PHASES.map((p) => (
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
                value={draftCategory}
                onChange={(e) => setDraftCategory(e.target.value)}
              >
                {requirementCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label style={{ ...lbl, marginTop: "0.65rem" }}>
            Link to flow steps (optional — inserts synced blocks)
            <select
              multiple
              style={{ ...selectStyle, minHeight: 120 }}
              value={draftLinks}
              onChange={(e) =>
                setDraftLinks(
                  Array.from(e.target.selectedOptions).map((o) => o.value),
                )
              }
            >
              {flowNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title}
                </option>
              ))}
            </select>
          </label>
          <label style={{ ...lbl, marginTop: "0.65rem" }}>
            Additional detail (static — not auto-synced)
            <textarea
              style={{ ...inputStyle, minHeight: 80 }}
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="btn-primary"
            style={{ marginTop: "0.75rem" }}
            onClick={() => {
              if (!draftTitle.trim()) return;
              addRequirement({
                category: draftCategory,
                phase: draftPhase,
                title: draftTitle.trim(),
                body: buildBodyForNewRequirement(
                  flowNodes,
                  draftLinks,
                  draftBody,
                ),
                status: "draft",
                clientNotes: "",
                cpoNotes: "",
                linkedFlowNodeIds: draftLinks,
              });
              setDraftTitle("");
              setDraftBody("");
              setDraftLinks([]);
              setDraftOpen(false);
            }}
          >
            Save requirement
          </button>
        </section>
      ) : null}

      {phasesToShow.map((phase) => {
        const rows = grouped.get(phase);
        if (!rows?.length) return null;
        return (
          <section key={phase} style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "1.1rem",
                borderBottom: "1px solid var(--border)",
                paddingBottom: "0.35rem",
              }}
            >
              {phase}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {rows.map((r) => (
                <article
                  key={r.id}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    padding: "1rem",
                    background: "var(--bg-elevated)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                      alignItems: "baseline",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <input
                      style={{ ...inputStyle, flex: "2 1 200px", fontWeight: 600 }}
                      value={r.title}
                      onChange={(e) =>
                        updateRequirement(r.id, { title: e.target.value })
                      }
                    />
                    <select
                      style={{ ...selectStyle, flex: "0 0 140px" }}
                      value={r.status}
                      onChange={(e) =>
                        updateRequirement(r.id, {
                          status: e.target.value as RequirementStatus,
                        })
                      }
                    >
                      {statusesList().map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <label style={lbl}>
                      Phase
                      <select
                        style={selectStyle}
                        value={r.phase}
                        onChange={(e) =>
                          updateRequirement(r.id, {
                            phase: e.target.value as RequirementPhase,
                          })
                        }
                      >
                        {PHASES.map((p) => (
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
                        value={r.category}
                        onChange={(e) =>
                          updateRequirement(r.id, { category: e.target.value })
                        }
                      >
                        {requirementCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label style={lbl}>
                    Requirement body (synced blocks update from trade execution flow)
                    <textarea
                      style={{ ...inputStyle, minHeight: 120 }}
                      value={r.body}
                      onChange={(e) =>
                        updateRequirement(r.id, { body: e.target.value })
                      }
                    />
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.5rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    <label style={lbl}>
                      Client notes
                      <textarea
                        style={{ ...inputStyle, minHeight: 72 }}
                        value={r.clientNotes}
                        onChange={(e) =>
                          updateRequirement(r.id, {
                            clientNotes: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label style={lbl}>
                      CPO notes
                      <textarea
                        style={{ ...inputStyle, minHeight: 72 }}
                        value={r.cpoNotes}
                        onChange={(e) =>
                          updateRequirement(r.id, { cpoNotes: e.target.value })
                        }
                      />
                    </label>
                  </div>
                  {r.lastSyncedAt ? (
                    <p
                      style={{
                        margin: "0.5rem 0 0",
                        fontSize: "0.75rem",
                        color: "var(--muted)",
                      }}
                    >
                      Last flow sync: {new Date(r.lastSyncedAt).toLocaleString()}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
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

const lbl: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontSize: "0.75rem",
  color: "var(--muted)",
};
