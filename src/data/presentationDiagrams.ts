/**
 * Static Mermaid sources for the presentation flow page (swimlane-style).
 * Theme is applied globally in MermaidChart.
 */

/** Primary: actors as horizontal lanes, time flows left → right within each lane. */
export const SWIMLANE_END_TO_END = `flowchart TB
  subgraph OG["OmniGreen — allocator"]
    direction LR
    OG1[Subaccount orders] --> OG2[Roll up to omnibus instruction]
    OG2 --> OG3[Order file + purchase import to UMB]
    OG3 --> OG4[Bulk wire same calendar day]
  end
  subgraph CU["UMB — custodian"]
    direction LR
    CU1[Ingest files + fund wire] --> CU2[Custodian-side processing]
    CU2 --> CU3[Omnibus mutual fund order to street]
    CU3 --> CU4[Activity file → position file]
  end
  subgraph FD["Fund / transfer agent"]
    direction LR
    FD1[Omnibus trade at fund] --> FD2[Trade date + settlement cycle]
  end
  subgraph BR["OmniGreen — books & records"]
    direction LR
    BR1[Reconcile reporting] --> BR2[Allocate omnibus → subaccounts]
    BR2 --> BR3[Settled positions — API & dashboard]
  end
  OG4 --> CU1
  CU4 --> FD1
  FD2 --> BR1`;

/** Secondary: condensed lifecycle for decks — order → trade → omni → settled. */
export const SWIMLANE_LIFECYCLE = `flowchart TB
  subgraph L1["1 · Orders (OmniGreen)"]
    direction LR
    L1a[Capture client / advisor intent] --> L1b[Instruction on subaccount books]
  end
  subgraph L2["2 · Trades (OmniGreen → UMB)"]
    direction LR
    L2a[Batch becomes custodian trade] --> L2b[Files + cash to UMB]
    L2b --> L2c[Custodian executes omnibus instruction]
  end
  subgraph L3["3 · Omni at fund"]
    direction LR
    L3a[Fund sees omnibus line only] --> L3b[TA registers mutual fund trade]
    L3b --> L3c[Street-side omnibus position]
  end
  subgraph L4["4 · Settled"]
    direction LR
    L4a[Custodian confirms] --> L4b[OmniGreen updates omnibus + subaccounts]
    L4b --> L4c[Client-facing settled state]
  end
  L1b --> L2a
  L2c --> L3a
  L3c --> L4a`;
