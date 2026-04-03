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

function buildPath(
  a: Rect,
  b: Rect,
  sameCell: boolean,
): { d: string; labelX: number; labelY: number } {
  const acy = a.top + a.height / 2;
  const bcy = b.top + b.height / 2;
  const axc = a.left + a.width / 2;
  const bxc = b.left + b.width / 2;

  if (sameCell && Math.abs(acy - bcy) < 10) {
    const sx = a.right;
    const ex = b.left;
    const y = acy;
    return {
      d: `M ${sx} ${y} L ${ex} ${y}`,
      labelX: (sx + ex) / 2,
      labelY: y - 10,
    };
  }

  if (sameCell) {
    const goRight = a.left < b.left;
    const sx = goRight ? a.right : a.left;
    const sy = acy;
    const ex = goRight ? b.left : b.right;
    const ey = bcy;
    const mx = (sx + ex) / 2;
    const d = `M ${sx} ${sy} L ${mx} ${sy} L ${mx} ${ey} L ${ex} ${ey}`;
    return { d, labelX: mx, labelY: Math.min(sy, ey) - 8 };
  }

  if (a.bottom <= b.top + 6) {
    const sx = axc;
    const sy = a.bottom;
    const ex = bxc;
    const ey = b.top;
    const my = (sy + ey) / 2;
    const d = `M ${sx} ${sy} L ${sx} ${my} L ${ex} ${my} L ${ex} ${ey}`;
    return { d, labelX: (sx + ex) / 2, labelY: my - 10 };
  }
  if (b.bottom <= a.top + 6) {
    const sx = bxc;
    const sy = b.bottom;
    const ex = axc;
    const ey = a.top;
    const my = (sy + ey) / 2;
    const d = `M ${sx} ${sy} L ${sx} ${my} L ${ex} ${my} L ${ex} ${ey}`;
    return { d, labelX: (sx + ex) / 2, labelY: my - 10 };
  }

  if (a.right <= b.left + 4) {
    const sx = a.right;
    const sy = acy;
    const ex = b.left;
    const ey = bcy;
    const mx = (sx + ex) / 2;
    const d = `M ${sx} ${sy} L ${mx} ${sy} L ${mx} ${ey} L ${ex} ${ey}`;
    return { d, labelX: mx, labelY: Math.min(sy, ey) - 8 };
  }
  if (b.right <= a.left + 4) {
    const sx = b.right;
    const sy = bcy;
    const ex = a.left;
    const ey = acy;
    const mx = (sx + ex) / 2;
    const d = `M ${sx} ${sy} L ${mx} ${sy} L ${mx} ${ey} L ${ex} ${ey}`;
    return { d, labelX: mx, labelY: Math.min(sy, ey) - 8 };
  }

  const sx = axc;
  const sy = a.bottom;
  const ex = bxc;
  const ey = b.top;
  const my = (sy + ey) / 2;
  const d = `M ${sx} ${sy} L ${sx} ${my} L ${ex} ${my} L ${ex} ${ey}`;
  return { d, labelX: (sx + ex) / 2, labelY: my - 10 };
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
    fontSize: "0.78rem",
    lineHeight: 1.35,
    fontWeight: 500,
    color: "#0f172a",
    textAlign: "center",
    maxWidth: "min(14rem, 100%)",
    boxSizing: "border-box",
    position: "relative",
    zIndex: 2,
    backgroundClip: "padding-box",
  };

  const wrap = (inner: ReactNode) => (
    <div ref={(el) => setNodeRef(node.id, el)} style={{ display: "inline-block" }}>
      {inner}
    </div>
  );

  if (shape === "oval") {
    return wrap(
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
      </div>,
    );
  }
  if (shape === "hex") {
    return wrap(
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
      </div>,
    );
  }
  return wrap(
    <div
      style={{
        ...base,
        padding: "0.45rem 0.6rem",
        borderRadius: 2,
        background: "#38bdf8",
        border: "1px solid #0284c7",
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

function useEdgePaths(
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
          const fromEl = nodeRefs.current.get(edge.from);
          const toEl = nodeRefs.current.get(edge.to);
          if (!fromEl || !toEl) continue;
          const na = nodeById.get(edge.from);
          const nb = nodeById.get(edge.to);
          if (!na || !nb) continue;
          const fa = relRect(fromEl, cr);
          const ta = relRect(toEl, cr);
          const sameCell =
            na.laneIndex === nb.laneIndex && na.phaseIndex === nb.phaseIndex;
          const { d, labelX, labelY } = buildPath(fa, ta, sameCell);
          next.push({
            d,
            label: edge.label,
            labelX,
            labelY,
          });
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

export function SwimlaneFlow({ spec }: Props) {
  const { phases, lanes, nodes } = spec;
  const bodyRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLDivElement>());
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });
  const arrowId = useId().replace(/:/g, "");

  const setNodeRef = (id: string, el: HTMLDivElement | null) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  };

  const paths = useEdgePaths(spec, nodeRefs, bodyRef);

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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `11rem repeat(${phases.length}, minmax(7rem, 1fr))`,
          background: CARD.slateBar,
          color: CARD.slateText,
          borderBottom: `2px solid ${CARD.rule}`,
        }}
      >
        <div
          style={{
            borderRight: "1px solid rgba(255,255,255,0.25)",
            minHeight: 40,
          }}
        />
        {phases.map((seg, i) => (
          <div
            key={seg.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.8rem",
              fontWeight: 600,
              letterSpacing: "0.02em",
              padding: "0.5rem 0.5rem",
              borderRight:
                i < phases.length - 1
                  ? "1px solid rgba(255,255,255,0.35)"
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
            zIndex: 1,
            overflow: "visible",
          }}
          aria-hidden
        >
          <defs>
            <marker
              id={`swim-arrow-${arrowId}`}
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L8,3 L0,6 Z" fill={CARD.stroke} />
            </marker>
          </defs>
          {paths.map((p, i) => (
            <Fragment key={i}>
              <path
                d={p.d}
                fill="none"
                stroke={CARD.stroke}
                strokeWidth={1.75}
                strokeLinejoin="round"
                strokeLinecap="round"
                markerEnd={`url(#swim-arrow-${arrowId})`}
              />
              {p.label ? (
                <text
                  x={p.labelX}
                  y={p.labelY}
                  textAnchor="middle"
                  fill="#334155"
                  fontSize="10"
                  fontFamily={CARD.font}
                  fontWeight={600}
                  style={{ pointerEvents: "none" }}
                >
                  {p.label.length > 42 ? `${p.label.slice(0, 40)}…` : p.label}
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
              gridTemplateColumns: `11rem repeat(${phases.length}, minmax(7rem, 1fr))`,
              borderBottom:
                li < lanes.length - 1 ? `2px solid ${CARD.rule}` : undefined,
              position: "relative",
              zIndex: 2,
              background: CARD.bg,
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
                padding: "0.5rem 0.55rem",
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
                  style={{
                    background: lane.laneTint,
                    padding: "0.75rem 0.6rem",
                    minHeight: 56,
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    alignContent: "center",
                    gap: "0.35rem 0.25rem",
                    borderRight:
                      pi < phases.length - 1
                        ? `1px solid rgba(255,255,255,0.85)`
                        : undefined,
                  }}
                >
                  {cellNodes.length === 0 ? null : (
                    cellNodes.map((n) => (
                      <StepBox key={n.id} node={n} setNodeRef={setNodeRef} />
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
