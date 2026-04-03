import { useAppStore } from "@/store/useAppStore";
import type { DecisionStatus } from "@/types";

export function QuestionsPage() {
  const questions = useAppStore((s) => s.questions);
  const updateQuestion = useAppStore((s) => s.updateQuestion);
  const addQuestion = useAppStore((s) => s.addQuestion);
  const requirements = useAppStore((s) => s.requirements);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>{`Open questions & decisions`}</h1>
      <p style={{ color: "var(--muted)", maxWidth: "65ch" }}>
        Shared tracker for UMB timing questions, file semantics, and product
        calls. Link rows to requirements for traceability. Export JSON from the
        header to swap versions with your CPO.
      </p>
      <button
        type="button"
        className="btn-primary"
        style={{ marginTop: "0.75rem", marginBottom: "1.25rem" }}
        onClick={() => addQuestion()}
      >
        Add question
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {questions.map((q) => (
          <article
            key={q.id}
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
                marginBottom: "0.5rem",
              }}
            >
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
                    {r.title}
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
        ))}
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
