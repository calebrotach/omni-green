/** Swimlane data for presentation charts (styled like classic horizontal swimlane diagrams). */

export type SwimlaneStepShape = "oval" | "rect" | "hex";

export type SwimlaneStep = {
  text: string;
  /** Default: rect. Oval for start/end-style nodes; hex for decisions. */
  shape?: SwimlaneStepShape;
};

export type SwimlaneTimelineSegment = {
  label: string;
};

export type SwimlaneRow = {
  title: string;
  /** Solid header strip (role label), white text */
  headerColor: string;
  /** Pale lane background behind the step row */
  laneTint: string;
  steps: SwimlaneStep[];
};

export type SwimlaneChartSpec = {
  timeline?: SwimlaneTimelineSegment[];
  lanes: SwimlaneRow[];
};

function withDefaultShapes(steps: SwimlaneStep[]): SwimlaneStep[] {
  if (steps.length === 0) return steps;
  return steps.map((s, i) => {
    const shape =
      s.shape ??
      (i === 0 || i === steps.length - 1 ? ("oval" as const) : ("rect" as const));
    return { ...s, shape };
  });
}

function row(
  title: string,
  headerColor: string,
  laneTint: string,
  steps: SwimlaneStep[],
): SwimlaneRow {
  return {
    title,
    headerColor,
    laneTint,
    steps: withDefaultShapes(steps),
  };
}

/** End-to-end: role colors inspired by the reference (distinct hues per lane). */
export const END_TO_END_CHART: SwimlaneChartSpec = {
  timeline: [{ label: "Same day (ET)" }, { label: "Settlement cycle" }],
  lanes: [
    row(
      "OmniGreen — allocator",
      "#6d28d9",
      "#f3e8ff",
      [
        { text: "Subaccount orders" },
        { text: "Roll up to omnibus instruction" },
        { text: "Order file + purchase import to UMB" },
        { text: "Bulk wire same calendar day" },
      ],
    ),
    row(
      "UMB — custodian",
      "#15803d",
      "#dcfce7",
      [
        { text: "Ingest files + funding" },
        { text: "Custodian-side processing" },
        { text: "Omnibus mutual fund order to street" },
        { text: "Activity + position files" },
      ],
    ),
    row(
      "Fund / transfer agent",
      "#1d4ed8",
      "#dbeafe",
      [{ text: "Omnibus trade at fund" }, { text: "Trade date + settlement cycle" }],
    ),
    row(
      "OmniGreen — books & records",
      "#b91c1c",
      "#fee2e2",
      [
        { text: "Reconcile custodian reporting" },
        { text: "Allocate omnibus → subaccounts" },
        { text: "Settled — API & dashboard" },
      ],
    ),
  ],
};

export const LIFECYCLE_CHART: SwimlaneChartSpec = {
  timeline: [{ label: "Order & trade" }, { label: "Fund & settled" }],
  lanes: [
    row(
      "1 · Orders — OmniGreen",
      "#6d28d9",
      "#f3e8ff",
      [
        { text: "Capture client / advisor intent" },
        { text: "Instruction on subaccount books" },
      ],
    ),
    row(
      "2 · Trades — OmniGreen → UMB",
      "#15803d",
      "#dcfce7",
      [
        { text: "Batch becomes custodian trade" },
        { text: "Files + cash to UMB" },
        { text: "Custodian executes omnibus instruction" },
      ],
    ),
    row(
      "3 · Omni at fund",
      "#1d4ed8",
      "#dbeafe",
      [
        { text: "Fund sees omnibus line only" },
        { text: "TA registers mutual fund trade" },
        { text: "Street-side omnibus position" },
      ],
    ),
    row(
      "4 · Settled",
      "#b91c1c",
      "#fee2e2",
      [
        { text: "Custodian confirms" },
        { text: "OmniGreen updates omnibus + subaccounts" },
        { text: "Client-facing settled state" },
      ],
    ),
  ],
};
