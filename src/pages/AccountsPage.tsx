import { MermaidChart } from "@/components/MermaidChart";

const ACCOUNT_DIAGRAM = `flowchart TB
  subgraph Client["Client / advisor view"]
    SA1[Subaccount A]
    SA2[Subaccount B]
  end

  subgraph OmniGreen["OmniGreen books & API"]
    OMNIBUS[Omnibus account record]
    SA1 --> OMNIBUS
    SA2 --> OMNIBUS
  end

  subgraph UMB["UMB custody"]
    UMBOMNI[Omnibus custody / trading account]
  end

  subgraph Fund["Fund / TA (street)"]
    FUNDOMNI[Fund omnibus registration]
  end

  OMNIBUS -->|Order file + import + wire| UMBOMNI
  UMBOMNI -->|Omnibus trade| FUNDOMNI

  classDef note fill:#1a2430,stroke:#8fa3b8,color:#e8eef4;
  N1[Subaccounts exist only at OmniGreen]:::note
  N2[Omnibus must exist at OmniGreen, UMB, and fund]:::note
`;

export function AccountsPage() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Account relationships</h1>
      <p style={{ color: "var(--muted)", maxWidth: "65ch" }}>
        OmniGreen maintains the economic truth for subaccounts while funds and
        UMB only see omnibus identifiers. When a new requirements category
        appears (e.g., “Segregation of duties”), add it under Requirements by timeline so the
        governance story stays aligned with this structure.
      </p>
      <div style={{ marginTop: "1.25rem" }}>
        <MermaidChart definition={ACCOUNT_DIAGRAM} />
      </div>
      <ul style={{ color: "var(--muted)", maxWidth: "62ch" }}>
        <li>
          <strong style={{ color: "var(--text)" }}>Subaccounts</strong> — OmniGreen
          only (books &amp; records, API, ops dashboard). Used for client
          reporting and internal controls.
        </li>
        <li style={{ marginTop: "0.5rem" }}>
          <strong style={{ color: "var(--text)" }}>Omnibus at OmniGreen</strong>{" "}
          — mirrors custody and fund positions after reconciliation.
        </li>
        <li style={{ marginTop: "0.5rem" }}>
          <strong style={{ color: "var(--text)" }}>Omnibus at UMB</strong> — receives
          files and cash; sends activity/position files.
        </li>
        <li style={{ marginTop: "0.5rem" }}>
          <strong style={{ color: "var(--text)" }}>Omnibus at fund / TA</strong> —
          legal ownership layer for mutual fund shares in street name.
        </li>
      </ul>
    </div>
  );
}
