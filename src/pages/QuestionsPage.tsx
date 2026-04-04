import { PhaseQuickReference } from "@/components/PhaseQuickReference";
import {
  getPhaseTheme,
  NEUTRAL_TRACE_THEME,
  REQUIREMENT_PHASES_ORDER,
} from "@/lib/phaseColors";
import { useAppStore } from "@/store/useAppStore";
import type { DecisionStatus, OpenQuestion, Requirement, RequirementPhase } from "@/types";

function sortedLinkedPhases(
  q: OpenQuestion,
  requirements: Requirement[],
): RequirementPhase[] {
  const byId = new Map(requirements.map((r) => [r.id, r]));
  const seen = new Set<RequirementPhase>();
  const list: RequirementPhase[] = [];
  for (const id of q.linkedRequirementIds) {
    const r = byId.get(id);
    if (!r || seen.has(r.phase)) continue;
    seen.add(r.phase);
    list.push(r.phase);
  }
  list.sort(
    (a, b) =>
      REQUIREMENT_PHASES_ORDER.indexOf(a) - REQUIREMENT_PHASES_ORDER.indexOf(b),
  );
  return list;
}

export function QuestionsPage() {
  const questions = useAppStore((s) => s.questions);
  const updateQuestion = useAppStore((s) => s.updateQuestion);
  const addQuestion = useAppStore((s) => s.addQuestion);
  const requirements = useAppStore((s) => s.requirements);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>{`Open questions & decisions`}</h1>
      <p
        style={{
          color: "var(--muted)",
          maxWidth: "72ch",
          lineHeight: 1.55,
          marginBottom: "0.65rem",
        }}
      >
        Shared tracker for UMB timing, files, and product decisions.{" "}
        <strong>Link requirements</strong> for traceability — card colors follow the{" "}
        <strong>earliest linked timeline phase</strong> (same palette as Trade execution flow and
        Requirements). Export JSON from the header to share with your CPO.
      </p>

      <PhaseQuickReference />

      <button
        type="button"
        className="btn-primary"
        style={{ marginTop: 0, marginBottom: "1.25rem" }}
        onClick={() => addQuestion()}
      >
        Add question
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {questions.map((q) => {
          const phases = sortedLinkedPhases(q, requirements);
          const primary = phases[0];
          const theme = primary ? getPhaseTheme(primary) : NEUTRAL_TRACE_THEME;

          return (
            <article
              key={q.id}
              style={{
                border: "1px solid var(--border)",
                borderLeft: `4px solid ${theme.accent}`,
                borderRadius: 12,
                padding: "1rem",
                paddingTop: 0,
                background: "var(--bg-elevated)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  margin: "0 -1rem 0.75rem -1rem",
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid var(--border)",
                  background: `linear-gradient(90deg, ${theme.darkPanelTint} 0%, var(--bg-elevated) 50%)`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    alignItems: "center",
                    marginBottom: phases.length ? "0.5rem" : 0,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: theme.accent,
                      flexShrink: 0,
                    }}
                  />
                  <input
                    style={{ ...inp, flex: "1 1 160px" }}
                    value={q.topic}
                    onChange={(e) =>
                      updateQuestion(q.id, { topic: e.target.value })
                    }
                    placeholder="Topic"
                  />
                  <select
                    style={{ ...inp, flex: "0 0 140px" }}
                    value={q.status}
                    onChange={(e) =>
                      updateQuestion(q.id, {
                        status: e.target.value as DecisionStatus,
                      })
                    }
                  >
                    <option value="open">Open</option>
                    <option value="decided">Decided</option>
                    <option value="parked">Parked</option>
                  </select>
                  <input
                    style={{ ...inp, flex: "1 1 160px" }}
                    value={q.owner}
                    onChange={(e) =>
                      updateQuestion(q.id, { owner: e.target.value })
                    }
                    placeholder="Owner"
                  />
                </div>
                {phases.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.35rem 0.75rem",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "var(--muted)",
                      }}
                    >
                      From linked requirements
                    </span>
                    {phases.map((p) => {
                      const t = getPhaseTheme(p);
                      return (
                        <span
                          key={p}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: "0.78rem",
                            color: t.accent,
                            fontWeight: 500,
                          }}
                        >
                          <span
                            aria-hidden
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: 2,
                              background: t.accent,
                              flexShrink: 0,
                            }}
                          />
                          {p}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.78rem",
                      color: "var(--muted)",
                    }}
                  >
                    Link requirements below — phase colors update from those rows.
                  </p>
                )}
              </div>

              <label style={lbl}>
                Question
                <textarea
                  style={{ ...inp, minHeight: 64 }}
                  value={q.question}
                  onChange={(e) =>
                    updateQuestion(q.id, { question: e.target.value })
                  }
                />
              </label>
              <label style={{ ...lbl, marginTop: "0.5rem" }}>
                Decision / outcome
                <textarea
                  style={{ ...inp, minHeight: 72 }}
                  value={q.decision}
                  onChange={(e) =>
                    updateQuestion(q.id, { decision: e.target.value })
                  }
                />
              </label>
              <label style={{ ...lbl, marginTop: "0.5rem" }}>
                Linked requirements (hold ⌘/Ctrl to multi-select)
                <select
                  multiple
                  style={{ ...inp, minHeight: 100 }}
                  value={q.linkedRequirementIds}
                  onChange={(e) =>
                    updateQuestion(q.id, {
                      linkedRequirementIds: Array.from(
                        e.target.selectedOptions,
                        (o) => o.value,
                      ),
                    })
                  }
                >
                  {requirements.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.phase}] {r.title}
                    </option>
                  ))}
                </select>
              </label>
              <p
                style={{
                  margin: "0.5rem 0 0",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                }}
              >
                Updated {new Date(q.updatedAt).toLocaleString()}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

const inp = {
  padding: "0.45rem 0.55rem",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--bg)",
  color: "var(--text)",
} as const;

const lbl = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 4,
  fontSize: "0.75rem",
  color: "var(--muted)",
};
