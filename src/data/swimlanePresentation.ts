/**
 * Swimlane graph: nodes sit in phase columns + lane rows; edges show sequence and handoffs.
 */

export type SwimlaneNodeShape = "oval" | "rect" | "hex";

export type SwimlaneGraphNode = {
  id: string;
  laneIndex: number;
  phaseIndex: number;
  /** Sort order within the same (lane, phase) cell */
  order: number;
  text: string;
  shape?: SwimlaneNodeShape;
};

export type SwimlaneGraphEdge = {
  from: string;
  to: string;
  /** Handoff / flow label (e.g. what crosses the boundary) */
  label?: string;
};

export type SwimlaneGraphLane = {
  title: string;
  headerColor: string;
  laneTint: string;
};

export type SwimlaneGraphPhase = {
  label: string;
};

export type SwimlaneGraphSpec = {
  phases: SwimlaneGraphPhase[];
  lanes: SwimlaneGraphLane[];
  nodes: SwimlaneGraphNode[];
  edges: SwimlaneGraphEdge[];
};

function applyDefaultShapes(nodes: SwimlaneGraphNode[]): SwimlaneGraphNode[] {
  const keys = new Map<string, SwimlaneGraphNode[]>();
  for (const n of nodes) {
    const k = `${n.laneIndex}-${n.phaseIndex}`;
    if (!keys.has(k)) keys.set(k, []);
    keys.get(k)!.push(n);
  }
  for (const group of keys.values()) {
    group.sort((a, b) => a.order - b.order);
    const last = group.length - 1;
    for (let i = 0; i < group.length; i++) {
      if (group[i]!.shape) continue;
      group[i]!.shape =
        i === 0 || i === last ? ("oval" as const) : ("rect" as const);
    }
  }
  return nodes;
}

/** Full execution path: same-day OG+UMB → fund settlement → books. */
const endToEndNodesRaw: SwimlaneGraphNode[] = [
  // Phase 0 — same day (ET)
  { id: "og1", laneIndex: 0, phaseIndex: 0, order: 0, text: "Subaccount orders" },
  {
    id: "og2",
    laneIndex: 0,
    phaseIndex: 0,
    order: 1,
    text: "Roll up to omnibus instruction",
  },
  {
    id: "og3",
    laneIndex: 0,
    phaseIndex: 0,
    order: 2,
    text: "Order file + purchase import to UMB",
  },
  {
    id: "og4",
    laneIndex: 0,
    phaseIndex: 0,
    order: 3,
    text: "Bulk wire same calendar day",
  },
  {
    id: "u1",
    laneIndex: 1,
    phaseIndex: 0,
    order: 0,
    text: "Ingest files + funding",
  },
  {
    id: "u2",
    laneIndex: 1,
    phaseIndex: 0,
    order: 1,
    text: "Custodian-side processing",
  },
  {
    id: "u3",
    laneIndex: 1,
    phaseIndex: 0,
    order: 2,
    text: "Omnibus mutual fund order to street",
  },
  {
    id: "u4",
    laneIndex: 1,
    phaseIndex: 0,
    order: 3,
    text: "Activity + position files",
  },
  // Phase 1 — settlement / books
  {
    id: "f1",
    laneIndex: 2,
    phaseIndex: 1,
    order: 0,
    text: "Omnibus trade at fund",
  },
  {
    id: "f2",
    laneIndex: 2,
    phaseIndex: 1,
    order: 1,
    text: "Trade date + settlement cycle",
  },
  {
    id: "b1",
    laneIndex: 3,
    phaseIndex: 1,
    order: 0,
    text: "Reconcile custodian reporting",
  },
  {
    id: "b2",
    laneIndex: 3,
    phaseIndex: 1,
    order: 1,
    text: "Allocate omnibus → subaccounts",
  },
  {
    id: "b3",
    laneIndex: 3,
    phaseIndex: 1,
    order: 2,
    text: "Settled — API & dashboard",
  },
];

const endToEndEdges: SwimlaneGraphEdge[] = [
  { from: "og1", to: "og2" },
  { from: "og2", to: "og3" },
  { from: "og3", to: "og4" },
  {
    from: "og4",
    to: "u1",
    label: "Order file, purchase import, bulk wire",
  },
  { from: "u1", to: "u2" },
  { from: "u2", to: "u3" },
  { from: "u3", to: "u4" },
  {
    from: "u4",
    to: "f1",
    label: "Street execution & fund reporting",
  },
  { from: "f1", to: "f2" },
  {
    from: "f2",
    to: "b1",
    label: "Settlement + files → books",
  },
  { from: "b1", to: "b2" },
  { from: "b2", to: "b3" },
];

export const END_TO_END_GRAPH: SwimlaneGraphSpec = {
  phases: [{ label: "Same day (ET)" }, { label: "Settlement & books" }],
  lanes: [
    {
      title: "OmniGreen — allocator",
      headerColor: "#6d28d9",
      laneTint: "#f3e8ff",
    },
    {
      title: "UMB — custodian",
      headerColor: "#15803d",
      laneTint: "#dcfce7",
    },
    {
      title: "Fund / transfer agent",
      headerColor: "#1d4ed8",
      laneTint: "#dbeafe",
    },
    {
      title: "OmniGreen — books & records",
      headerColor: "#b91c1c",
      laneTint: "#fee2e2",
    },
  ],
  nodes: applyDefaultShapes([...endToEndNodesRaw]),
  edges: endToEndEdges,
};

/** Lifecycle: orders → trades (p0) → omni → settled (p1). */
const lifecycleNodesRaw: SwimlaneGraphNode[] = [
  {
    id: "l1a",
    laneIndex: 0,
    phaseIndex: 0,
    order: 0,
    text: "Capture client / advisor intent",
  },
  {
    id: "l1b",
    laneIndex: 0,
    phaseIndex: 0,
    order: 1,
    text: "Instruction on subaccount books",
  },
  {
    id: "l2a",
    laneIndex: 1,
    phaseIndex: 0,
    order: 0,
    text: "Batch becomes custodian trade",
  },
  {
    id: "l2b",
    laneIndex: 1,
    phaseIndex: 0,
    order: 1,
    text: "Files + cash to UMB",
  },
  {
    id: "l2c",
    laneIndex: 1,
    phaseIndex: 0,
    order: 2,
    text: "Custodian executes omnibus instruction",
  },
  {
    id: "l3a",
    laneIndex: 2,
    phaseIndex: 1,
    order: 0,
    text: "Fund sees omnibus line only",
  },
  {
    id: "l3b",
    laneIndex: 2,
    phaseIndex: 1,
    order: 1,
    text: "TA registers mutual fund trade",
  },
  {
    id: "l3c",
    laneIndex: 2,
    phaseIndex: 1,
    order: 2,
    text: "Street-side omnibus position",
  },
  {
    id: "l4a",
    laneIndex: 3,
    phaseIndex: 1,
    order: 0,
    text: "Custodian confirms",
  },
  {
    id: "l4b",
    laneIndex: 3,
    phaseIndex: 1,
    order: 1,
    text: "OmniGreen updates omnibus + subaccounts",
  },
  {
    id: "l4c",
    laneIndex: 3,
    phaseIndex: 1,
    order: 2,
    text: "Client-facing settled state",
  },
];

const lifecycleEdges: SwimlaneGraphEdge[] = [
  { from: "l1a", to: "l1b" },
  {
    from: "l1b",
    to: "l2a",
    label: "Batch to custodian",
  },
  { from: "l2a", to: "l2b" },
  { from: "l2b", to: "l2c" },
  {
    from: "l2c",
    to: "l3a",
    label: "Omnibus order to fund / TA",
  },
  { from: "l3a", to: "l3b" },
  { from: "l3b", to: "l3c" },
  {
    from: "l3c",
    to: "l4a",
    label: "Confirmations & positions in",
  },
  { from: "l4a", to: "l4b" },
  { from: "l4b", to: "l4c" },
];

export const LIFECYCLE_GRAPH: SwimlaneGraphSpec = {
  phases: [{ label: "Order & trade" }, { label: "Fund & settled" }],
  lanes: END_TO_END_GRAPH.lanes.map((l, i) =>
    i === 0
      ? { ...l, title: "1 · Orders — OmniGreen" }
      : i === 1
        ? { ...l, title: "2 · Trades — OmniGreen → UMB" }
        : i === 2
          ? { ...l, title: "3 · Omni at fund" }
          : { ...l, title: "4 · Settled" },
  ),
  nodes: applyDefaultShapes([...lifecycleNodesRaw]),
  edges: lifecycleEdges,
};

/**
 * One order, one thread: subaccount → omnibus (out) → custodian → fund → back to
 * subaccount economics. Edge labels call out state / representation changes.
 */
const singleOrderNodesRaw: SwimlaneGraphNode[] = [
  {
    id: "so1",
    laneIndex: 0,
    phaseIndex: 0,
    order: 0,
    text: "Subaccount state: instruction lives on OmniGreen B&R",
  },
  {
    id: "so2",
    laneIndex: 0,
    phaseIndex: 0,
    order: 1,
    text: "Batching: folded into omnibus purchase line (internal subacct map)",
  },
  {
    id: "so3",
    laneIndex: 0,
    phaseIndex: 0,
    order: 2,
    text: "Outbound: purchase import + bulk wire — custodian sees omnibus only",
  },
  {
    id: "su1",
    laneIndex: 1,
    phaseIndex: 0,
    order: 0,
    text: "UMB: omnibus working order + funding matched",
  },
  {
    id: "su2",
    laneIndex: 1,
    phaseIndex: 0,
    order: 1,
    text: "Street handoff: omnibus block to fund / NSCC (no subaccount id)",
  },
  {
    id: "sf1",
    laneIndex: 2,
    phaseIndex: 1,
    order: 0,
    text: "Fund / TA state: one omnibus trade line",
  },
  {
    id: "sf2",
    laneIndex: 2,
    phaseIndex: 1,
    order: 1,
    text: "Omnibus settlement completes (street / contract)",
  },
  {
    id: "su3",
    laneIndex: 1,
    phaseIndex: 1,
    order: 0,
    text: "UMB → OmniGreen: activity + position files (omnibus references)",
  },
  {
    id: "sb1",
    laneIndex: 3,
    phaseIndex: 1,
    order: 0,
    text: "OmniGreen: reconcile omnibus ledger to custodian",
  },
  {
    id: "sb2",
    laneIndex: 3,
    phaseIndex: 1,
    order: 1,
    text: "Transform: allocate omnibus result → subaccount lots / economics",
  },
  {
    id: "sb3",
    laneIndex: 3,
    phaseIndex: 1,
    order: 2,
    text: "Subaccount state again: settled position — API & dashboard",
  },
];

const singleOrderEdges: SwimlaneGraphEdge[] = [
  {
    from: "so1",
    to: "so2",
    label: "Still subaccount; eligible for batch",
  },
  {
    from: "so2",
    to: "so3",
    label: "Representation → omnibus for outbound file",
  },
  {
    from: "so3",
    to: "su1",
    label: "Same-day import + wire (non-AIP style)",
  },
  { from: "su1", to: "su2", label: "Custodian STP" },
  {
    from: "su2",
    to: "sf1",
    label: "Omnibus-only message to TA",
  },
  { from: "sf1", to: "sf2", label: "Trade date + settlement" },
  {
    from: "sf2",
    to: "su3",
    label: "Reporting path to allocator",
  },
  {
    from: "su3",
    to: "sb1",
    label: "Ingest files (omnibus layer)",
  },
  {
    from: "sb1",
    to: "sb2",
    label: "Books: omnibus → subacct split",
  },
  {
    from: "sb2",
    to: "sb3",
    label: "Client-visible state",
  },
];

export const SINGLE_ORDER_TRACE_GRAPH: SwimlaneGraphSpec = {
  phases: [
    { label: "Instruction & transmit (same day)" },
    { label: "Street, settle & subaccount allocation" },
  ],
  lanes: [
    {
      title: "OmniGreen — batching",
      headerColor: "#6d28d9",
      laneTint: "#f3e8ff",
    },
    {
      title: "UMB — custody",
      headerColor: "#15803d",
      laneTint: "#dcfce7",
    },
    {
      title: "Fund / TA",
      headerColor: "#1d4ed8",
      laneTint: "#dbeafe",
    },
    {
      title: "OmniGreen — books & client",
      headerColor: "#b91c1c",
      laneTint: "#fee2e2",
    },
  ],
  nodes: applyDefaultShapes([...singleOrderNodesRaw]),
  edges: singleOrderEdges,
};
