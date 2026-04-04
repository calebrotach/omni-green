import { getPhaseTheme, REQUIREMENT_PHASES_ORDER } from "@/lib/phaseColors";

/** Numbered timeline phases + swatches — same on Requirements and Open questions pages. */
export function PhaseQuickReference() {
  return (
    <section
      aria-label="Timeline phases in execution order"
      style={{
        margin: "0 0 1.25rem",
        maxWidth: 640,
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "0.85rem 1rem 0.95rem",
        background: "var(--bg-elevated)",
      }}
    >
      <h2
        style={{
          margin: "0 0 0.65rem",
          fontSize: "0.82rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        Quick reference — timeline phases (in order)
      </h2>
      <ol
        style={{
          margin: 0,
          paddingLeft: "1.35rem",
          lineHeight: 1.65,
          fontSize: "0.9rem",
          color: "var(--text)",
        }}
      >
        {REQUIREMENT_PHASES_ORDER.map((p) => {
          const t = getPhaseTheme(p);
          return (
            <li key={p} style={{ paddingLeft: "0.25rem" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 2,
                    background: t.accent,
                    flexShrink: 0,
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.1)",
                  }}
                />
                {p}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
