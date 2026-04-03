import type { CSSProperties } from "react";
import {
  Fragment,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { SwimlaneGraphNode, SwimlaneGraphSpec } from "@/data/swimlanePresentation";

type Props = {
  spec: SwimlaneGraphSpec;
};

const CARD = {
  bg: "#f8fafc",
  border: "#e2e8f0",
  slateBar: "#334155",
  slateText: "#ffffff",
  rule: "#ffffff",
  stroke: "#0f172a",
  phaseLine: "#94a3b8",
  font: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
} as const;

type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
};

function relRect(el: HTMLElement, container: DOMRect): Rect {
  const r = el.getBoundingClientRect();
  return {
    left: r.left - container.left,
    top: r.top - container.top,
    width: r.width,
    height: r.height,
    right: r.right - container.left,
    bottom: r.bottom - container.top,
  };
}

/**
 * Strict orthogonal paths (reference-style: 90° corners, no diagonals).
 * Only for cross-cell edges; same-cell uses DOM connectors.
 */
function buildOrthogonalPath(
  from: Rect,
  to: Rect,
): { d: string; labelX: number; labelY: number } {
  const fx = from.left + from.width / 2;
  const fyT = from.top;
  const fyB = from.bottom;
  const fyM = from.top + from.height / 2;
  const tx = to.left + to.width / 2;
  const tyT = to.top;
  const tyB = to.bottom;
  const tyM = to.top + to.height / 2;

  const sameBand = Math.abs(fyM - tyM) < 20;
  const toRight = to.left >= from.right - 4;

  // Same row-ish, target to the right (phase boundary handoff)
  if (toRight && sameBand) {
    const y = (fyM + tyM) / 2;
    const d = `M ${from.right} ${y} L ${to.left} ${y}`;
    return {
      d,
      labelX: (from.right + to.left) / 2,
      labelY: y - 9,
    };
  }

  // Source entirely above target (handoff downward)
  if (from.bottom <= tyT + 8) {
    const sx = fx;
    const sy = fyB;
    const ex = tx;
    const ey = tyT;
    const my = (sy + ey) / 2;
    const d = `M ${sx} ${sy} L ${sx} ${my} L ${ex} ${my} L ${ex} ${ey}`;
    return { d, labelX: (sx + ex) / 2, labelY: my - 10 };
  }

  // Source entirely below target (handoff upward — e.g. fund → UMB)
  if (to.bottom <= fyT + 8) {
    const sx = fx;
    const sy = fyT;
    const ex = tx;
    const ey = tyB;
    const my = (sy + ey) / 2;
    const d = `M ${sx} ${sy} L ${sx} ${my} L ${ex} ${my} L ${ex} ${ey}`;
    return { d, labelX: (sx + ex) / 2, labelY: my - 10 };
  }

  // Target to the right with vertical offset
  if (to.left > from.right + 8) {
    const mx = (from.right + to.left) / 2;
    const d = `M ${from.right} ${fyM} L ${mx} ${fyM} L ${mx} ${tyM} L ${to.left} ${tyM}`;
    return { d, labelX: mx, labelY: Math.min(fyM, tyM) - 10 };
  }

  // Target to the left
  if (to.right < from.left - 8) {
    const mx = (from.left + to.right) / 2;
    const d = `M ${from.left} ${fyM} L ${mx} ${fyM} L ${mx} ${tyM} L ${to.right} ${tyM}`;
    return { d, labelX: mx, labelY: Math.min(fyM, tyM) - 10 };
  }

  // Fallback: classic down then across
  const sx = fx;
  const sy = fyB;
  const ex = tx;
  const ey = tyT;
  const my = (sy + ey) / 2;
  const d = `M ${sx} ${sy} L ${sx} ${my} L ${ex} ${my} L ${ex} ${ey}`;
  return { d, labelX: (sx + ex) / 2, labelY: my - 10 };
}

/** Black horizontal segment + arrow, like printed flowcharts */
function FlowArrowRight() {
  return (
    <div
      aria-hidden
      style={{
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        height: 24,
      }}
    >
      <div
        style={{
          width: 22,
          height: 2,
          background: CARD.stroke,
          flexShrink: 0,
        }}
      />
      <svg width={9} height={10} viewBox="0 0 9 10" style={{ marginLeft: -1 }}>
        <polygon points="0,0 9,5 0,10" fill={CARD.stroke} />
      </svg>
    </div>
  );
}

function StepBox({
  node,
  setNodeRef,
}: {
  node: SwimlaneGraphNode;
  setNodeRef: (id: string, el: HTMLDivElement | null) => void;
}) {
  const { text, shape = "rect" } = node;
  const base: CSSProperties = {
    fontFamily: CARD.font,
    fontSize: "0.76rem",
    lineHeight: 1.35,
    fontWeight: 500,
    color: "#0f172a",
    textAlign: "center",
    maxWidth: "13.5rem",
    minWidth: "4.5rem",
    boxSizing: "border-box",
    position: "relative",
    zIndex: 4,
    flexShrink: 0,
    backgroundClip: "padding-box",
    boxShadow: "0 0 0 1px rgba(15,23,42,0.06)",
  };

  const wrap = (inner: ReactNode) => (
    <div ref={(el) => setNodeRef(node.id, el)} style={{ flexShrink: 0 }}>
      {inner}
    </div>
  );

  if (shape === "oval") {
    return wrap(
      <div
        style={{
          ...base,
          padding: "0.42rem 0.95rem",
          borderRadius: 9999,
          background: "#fb923c",
          border: "1px solid #c2410c",
        }}
      >
        {text}
      </div>,
    );
  }
  if (shape === "hex") {
    return wrap(
      <div
        style={{
          ...base,
          padding: "0.48rem 0.8rem",
          background: "#facc15",
          border: "1px solid #ca8a04",
          clipPath:
            "polygon(12% 0%, 88% 0%, 100% 50%, 88% 100%, 12% 100%, 0% 50%)",
        }}
      >
        {text}
      </div>,
    );
  }
  return wrap(
    <div
      style={{
        ...base,
        padding: "0.42rem 0.55rem",
        borderRadius: 2,
        background: "#38bdf8",
        border: "1px solid #0369a1",
      }}
    >
      {text}
    </div>,
  );
}

type PathItem = {
  d: string;
  label?: string;
  labelX: number;
  labelY: number;
};

function useCrossCellPaths(
  spec: SwimlaneGraphSpec,
  nodeRefs: React.MutableRefObject<Map<string, HTMLDivElement>>,
  bodyRef: React.RefObject<HTMLDivElement | null>,
): PathItem[] {
  const [paths, setPaths] = useState<PathItem[]>([]);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    const run = () => {
      requestAnimationFrame(() => {
        const cr = body.getBoundingClientRect();
        const nodeById = new Map(spec.nodes.map((n) => [n.id, n]));
        const next: PathItem[] = [];

        for (const edge of spec.edges) {
          const na = nodeById.get(edge.from);
          const nb = nodeById.get(edge.to);
          if (!na || !nb) continue;
          const sameCell =
            na.laneIndex === nb.laneIndex && na.phaseIndex === nb.phaseIndex;
          if (sameCell) continue;

          const fromEl = nodeRefs.current.get(edge.from);
          const toEl = nodeRefs.current.get(edge.to);
          if (!fromEl || !toEl) continue;
          const fa = relRect(fromEl, cr);
          const ta = relRect(toEl, cr);
          const { d, labelX, labelY } = buildOrthogonalPath(fa, ta);
          next.push({ d, label: edge.label, labelX, labelY });
        }
        setPaths(next);
      });
    };

    run();
    const ro = new ResizeObserver(run);
    ro.observe(body);
    window.addEventListener("scroll", run, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", run, true);
    };
  }, [spec]);

  return paths;
}

function usePhaseDividerX(
  bodyRef: React.RefObject<HTMLDivElement | null>,
  phase0CellRef: React.RefObject<HTMLDivElement | null>,
  deps: number[],
): number | null {
  const [x, setX] = useState<number | null>(null);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    const cell = phase0CellRef.current;
    if (!body || !cell) return;

    const measure = () => {
      const br = body.getBoundingClientRect();
      const cr = cell.getBoundingClientRect();
      setX(cr.right - br.left);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(body);
    ro.observe(cell);
    return () => ro.disconnect();
  }, deps);

  return x;
}

export function SwimlaneFlow({ spec }: Props) {
  const { phases, lanes, nodes } = spec;
  const bodyRef = useRef<HTMLDivElement>(null);
  const phase0CellRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLDivElement>());
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });
  const arrowId = useId().replace(/:/g, "");

  const setNodeRef = (id: string, el: HTMLDivElement | null) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  };

  const paths = useCrossCellPaths(spec, nodeRefs, bodyRef);
  const phaseDividerX = usePhaseDividerX(bodyRef, phase0CellRef, [
    phases.length,
    lanes.length,
    nodes.length,
  ]);

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const sync = () =>
      setSvgSize({ w: el.offsetWidth, h: el.offsetHeight });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => ro.disconnect();
  }, [phases.length, lanes.length, nodes.length]);

  const nodesByCell = (laneIndex: number, phaseIndex: number) =>
    nodes
      .filter((n) => n.laneIndex === laneIndex && n.phaseIndex === phaseIndex)
      .sort((a, b) => a.order - b.order);

  const gridCols = `11rem repeat(${phases.length}, minmax(260px, 1fr))`;

  return (
    <div
      style={{
        fontFamily: CARD.font,
        border: `1px solid ${CARD.border}`,
        borderRadius: 8,
        overflow: "hidden",
        background: CARD.bg,
        overflowX: "auto",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: gridCols,
          background: CARD.slateBar,
          color: CARD.slateText,
          borderBottom: `2px solid ${CARD.rule}`,
        }}
      >
        <div
          style={{
            borderRight: "1px solid rgba(255,255,255,0.25)",
            minHeight: 42,
          }}
        />
        {phases.map((seg, i) => (
          <div
            key={seg.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              padding: "0.55rem 0.5rem",
              borderRight:
                i < phases.length - 1
                  ? "2px solid rgba(255,255,255,0.45)"
                  : undefined,
            }}
          >
            {seg.label}
          </div>
        ))}
      </div>

      <div ref={bodyRef} style={{ position: "relative" }}>
        <svg
          width={svgSize.w}
          height={svgSize.h}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            pointerEvents: "none",
            zIndex: 2,
            overflow: "visible",
          }}
          aria-hidden
        >
          <defs>
            <marker
              id={`swim-arrow-${arrowId}`}
              markerWidth="7"
              markerHeight="5"
              refX="6"
              refY="2.5"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0,0 L7,2.5 L0,5 Z" fill={CARD.stroke} />
            </marker>
          </defs>
          {phaseDividerX != null && phases.length > 1 ? (
            <line
              x1={phaseDividerX}
              y1={0}
              x2={phaseDividerX}
              y2={svgSize.h}
              stroke={CARD.phaseLine}
              strokeWidth={2}
            />
          ) : null}
          {paths.map((p, i) => (
            <Fragment key={i}>
              <path
                d={p.d}
                fill="none"
                stroke={CARD.stroke}
                strokeWidth={1.35}
                strokeLinejoin="miter"
                strokeLinecap="butt"
                markerEnd={`url(#swim-arrow-${arrowId})`}
              />
              {p.label ? (
                <text
                  x={p.labelX}
                  y={p.labelY}
                  textAnchor="middle"
                  fill="#1e293b"
                  fontSize="9.5"
                  fontFamily={CARD.font}
                  fontWeight={700}
                >
                  {p.label.length > 48 ? `${p.label.slice(0, 46)}…` : p.label}
                </text>
              ) : null}
            </Fragment>
          ))}
        </svg>

        {lanes.map((lane, li) => (
          <div
            key={lane.title}
            style={{
              display: "grid",
              gridTemplateColumns: gridCols,
              borderBottom:
                li < lanes.length - 1 ? `2px solid ${CARD.rule}` : undefined,
              position: "relative",
              zIndex: 3,
              background: CARD.bg,
            }}
          >
            <div
              style={{
                background: lane.headerColor,
                color: "#ffffff",
                fontSize: "0.76rem",
                fontWeight: 700,
                lineHeight: 1.25,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "0.5rem 0.5rem",
                borderRight: `2px solid ${CARD.rule}`,
              }}
            >
              {lane.title}
            </div>
            {phases.map((_, pi) => {
              const cellNodes = nodesByCell(li, pi);

              return (
                <div
                  key={pi}
                  ref={pi === 0 && li === 0 ? phase0CellRef : undefined}
                  style={{
                    background: lane.laneTint,
                    padding: "0.85rem 0.75rem",
                    minHeight: 72,
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "nowrap",
                    alignItems: "center",
                    alignContent: "center",
                    gap: 0,
                    overflowX: "auto",
                    overflowY: "hidden",
                    borderRight:
                      pi < phases.length - 1
                        ? "1px solid rgba(148,163,184,0.5)"
                        : undefined,
                  }}
                >
                  {cellNodes.length === 0 ? null : (
                    cellNodes.map((n, idx) => (
                      <Fragment key={n.id}>
                        {idx > 0 ? <FlowArrowRight /> : null}
                        <StepBox node={n} setNodeRef={setNodeRef} />
                      </Fragment>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
