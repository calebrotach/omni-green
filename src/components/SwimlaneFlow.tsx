import type { CSSProperties } from "react";
import { Fragment } from "react";
import type { SwimlaneChartSpec, SwimlaneStep } from "@/data/swimlanePresentation";

type Props = {
  spec: SwimlaneChartSpec;
};

const CARD = {
  bg: "#f8fafc",
  border: "#e2e8f0",
  slateBar: "#334155",
  slateText: "#ffffff",
  rule: "#ffffff",
  connector: "#0f172a",
  font: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
} as const;

function StepBox({ step }: { step: SwimlaneStep }) {
  const { text, shape = "rect" } = step;
  const base: CSSProperties = {
    fontFamily: CARD.font,
    fontSize: "0.78rem",
    lineHeight: 1.35,
    fontWeight: 500,
    color: "#0f172a",
    textAlign: "center",
    maxWidth: "min(15rem, 100%)",
    boxSizing: "border-box",
  };

  if (shape === "oval") {
    return (
      <div
        style={{
          ...base,
          padding: "0.45rem 1rem",
          borderRadius: 9999,
          background: "#fb923c",
          border: "1px solid #ea580c",
        }}
      >
        {text}
      </div>
    );
  }

  if (shape === "hex") {
    return (
      <div
        style={{
          ...base,
          padding: "0.5rem 0.85rem",
          background: "#facc15",
          border: "1px solid #ca8a04",
          clipPath:
            "polygon(12% 0%, 88% 0%, 100% 50%, 88% 100%, 12% 100%, 0% 50%)",
        }}
      >
        {text}
      </div>
    );
  }

  return (
    <div
      style={{
        ...base,
        padding: "0.45rem 0.65rem",
        borderRadius: 2,
        background: "#38bdf8",
        border: "1px solid #0284c7",
      }}
    >
      {text}
    </div>
  );
}

function Connector() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        padding: "0 0.1rem",
      }}
      aria-hidden
    >
      <div
        style={{
          width: 14,
          height: 2,
          background: CARD.connector,
        }}
      />
      <div
        style={{
          width: 0,
          height: 0,
          marginLeft: -1,
          borderTop: "4px solid transparent",
          borderBottom: "4px solid transparent",
          borderLeft: `6px solid ${CARD.connector}`,
        }}
      />
    </div>
  );
}

export function SwimlaneFlow({ spec }: Props) {
  const { lanes, timeline } = spec;
  const segments = timeline?.length ? timeline : null;

  return (
    <div
      style={{
        fontFamily: CARD.font,
        border: `1px solid ${CARD.border}`,
        borderRadius: 10,
        overflow: "hidden",
        background: CARD.bg,
        overflowX: "auto",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
      }}
    >
      {segments && segments.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `11rem repeat(${segments.length}, minmax(8rem, 1fr))`,
            background: CARD.slateBar,
            color: CARD.slateText,
            borderBottom: `2px solid ${CARD.rule}`,
          }}
        >
          <div
            style={{
              borderRight: `1px solid rgba(255,255,255,0.25)`,
              minHeight: 40,
            }}
          />
          {segments.map((seg, i) => (
            <div
              key={seg.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.02em",
                padding: "0.5rem 0.75rem",
                borderRight:
                  i < segments.length - 1
                    ? "1px solid rgba(255,255,255,0.35)"
                    : undefined,
                position: "relative",
              }}
            >
              {seg.label}
            </div>
          ))}
        </div>
      ) : null}

      {lanes.map((lane, i) => (
        <div
          key={lane.title}
          style={{
            display: "grid",
            gridTemplateColumns: "11rem 1fr",
            borderBottom:
              i < lanes.length - 1 ? `2px solid ${CARD.rule}` : undefined,
            minHeight: 56,
          }}
        >
          <div
            style={{
              background: lane.headerColor,
              color: "#ffffff",
              fontSize: "0.78rem",
              fontWeight: 700,
              lineHeight: 1.25,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "0.5rem 0.65rem",
              borderRight: `2px solid ${CARD.rule}`,
            }}
          >
            {lane.title}
          </div>
          <div
            style={{
              background: lane.laneTint,
              padding: "0.75rem 1rem",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0.15rem 0",
              minWidth: 0,
            }}
          >
            {lane.steps.map((step, j) => (
              <Fragment key={`${lane.title}-${j}`}>
                {j > 0 ? <Connector /> : null}
                <StepBox step={step} />
              </Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
