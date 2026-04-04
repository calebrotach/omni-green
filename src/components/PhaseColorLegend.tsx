import { getPhaseTheme, REQUIREMENT_PHASES_ORDER } from "@/lib/phaseColors";

type Props = {
  /** Tighter spacing when nested in toolbars */
  compact?: boolean;
};

export function PhaseColorLegend({ compact }: Props) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: compact ? "0.55rem 0.75rem" : "0.75rem 1rem",
        background: "var(--bg-elevated)",
      }}
    >
      <div
        style={{
          fontSize: compact ? "0.72rem" : "0.78rem",
          color: "var(--muted)",
          marginBottom: compact ? 6 : 8,
          fontWeight: 600,
          letterSpacing: "0.02em",
        }}
      >
        Requirement phases (colors match swimlane columns & requirement cards)
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: compact ? "0.35rem 0.75rem" : "0.45rem 1rem",
          alignItems: "center",
        }}
      >
        {REQUIREMENT_PHASES_ORDER.map((p) => {
          const t = getPhaseTheme(p);
          return (
            <span
              key={p}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: compact ? "0.78rem" : "0.82rem",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: compact ? 9 : 10,
                  height: compact ? 9 : 10,
                  borderRadius: 3,
                  background: t.accent,
                  flexShrink: 0,
                  boxShadow: `0 0 0 1px rgba(255,255,255,0.12)`,
                }}
              />
              {p}
            </span>
          );
        })}
      </div>
    </div>
  );
}
