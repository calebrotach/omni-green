/**
 * Swimlanes: each lane is one horizontal row (direction LR); lanes stack top → bottom (flowchart TB).
 * Handoffs land on the next lane’s header, then flow continues left → right in that row.
 */

const initPresentation = `%%{init: {'flowchart': {'useMaxWidth': false, 'padding': 12, 'nodeSpacing': 32, 'rankSpacing': 28}}}%%`;

const laneHeadClass = `
  classDef swimLaneHead fill:#1a2e24,stroke:#3dd68c,stroke-width:2px,color:#e8eef4`;

/** Primary: OmniGreen → UMB → Fund → books, rows stacked vertically. */
export const SWIMLANE_END_TO_END = `${initPresentation}
flowchart TB
  subgraph Lane_OG[" "]
    direction LR
    OGh[OmniGreen — allocator]:::swimLaneHead --> OG1[Subaccount orders] --> OG2[Roll up to omnibus instruction] --> OG3[Order file + purchase import] --> OG4[Bulk wire same day]
  end
  subgraph Lane_CU[" "]
    direction LR
    CUh[UMB — custodian]:::swimLaneHead --> CU1[Ingest files + funding] --> CU2[Custodian-side processing] --> CU3[Omnibus mutual fund order] --> CU4[Activity file → position file]
  end
  subgraph Lane_FD[" "]
    direction LR
    FDh[Fund / transfer agent]:::swimLaneHead --> FD1[Omnibus trade at fund] --> FD2[Trade date + settlement cycle]
  end
  subgraph Lane_BR[" "]
    direction LR
    BRh[OmniGreen — books & records]:::swimLaneHead --> BR1[Reconcile custodian reporting] --> BR2[Allocate omnibus → subaccounts] --> BR3[Settled positions — API & dashboard]
  end
  OG4 --> CUh
  CU4 --> FDh
  FD2 --> BRh${laneHeadClass}`;

/** Secondary: condensed lifecycle, same layout pattern. */
export const SWIMLANE_LIFECYCLE = `${initPresentation}
flowchart TB
  subgraph Lane_L1[" "]
    direction LR
    L1h[1 · Orders — OmniGreen]:::swimLaneHead --> L1a[Capture client / advisor intent] --> L1b[Instruction on subaccount books]
  end
  subgraph Lane_L2[" "]
    direction LR
    L2h[2 · Trades — OmniGreen → UMB]:::swimLaneHead --> L2a[Batch becomes custodian trade] --> L2b[Files + cash to UMB] --> L2c[Custodian executes omnibus instruction]
  end
  subgraph Lane_L3[" "]
    direction LR
    L3h[3 · Omni at fund]:::swimLaneHead --> L3a[Fund sees omnibus line only] --> L3b[TA registers mutual fund trade] --> L3c[Street-side omnibus position]
  end
  subgraph Lane_L4[" "]
    direction LR
    L4h[4 · Settled]:::swimLaneHead --> L4a[Custodian confirms] --> L4b[OmniGreen updates omnibus + subaccounts] --> L4c[Client-facing settled state]
  end
  L1b --> L2h
  L2c --> L3h
  L3c --> L4h${laneHeadClass}`;
