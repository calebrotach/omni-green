export function NarrativePage() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Element 4 · From order to books</h1>
      <article
        style={{
          color: "var(--muted)",
          maxWidth: "68ch",
          lineHeight: 1.65,
        }}
      >
        <p style={{ color: "var(--text)" }}>
          This narrative mirrors how a US mutual-fund omnibus instruction
          becomes street-side activity, then reconciles back to an allocator’s
          books. OmniGreen sits in the allocator role; UMB is the custodian
          receiving files and cash. Evergreen private-wealth programs (
          <a
            href="https://www.stepstonegroup.com/what-we-do/solutions-services/private-wealth-solutions/"
            target="_blank"
            rel="noreferrer"
          >
            StepStone-style evergreen structures
          </a>
          ) follow the same mechanical pattern even when the economic story is
          longer dated.
        </p>

        <h2 style={{ color: "var(--text)", fontSize: "1.05rem", marginTop: "1.5rem" }}>
          1. Order becomes an internal obligation
        </h2>
        <p>
          A client or advisor submits instructions through OmniGreen channels
          (dashboard or API). OmniGreen records the instruction at{" "}
          <strong>subaccount</strong> granularity on its own books and records.
          No subaccount identifier is sent to funds — only omnibus-level
          instructions leave the building.
        </p>

        <h2 style={{ color: "var(--text)", fontSize: "1.05rem", marginTop: "1.25rem" }}>
          2. OmniGreen builds the custodian batch
        </h2>
        <p>
          Throughout the trading day, OmniGreen aggregates eligible
          non-automated-investment-plan activity into a batch that matches UMB’s
          purchase import expectations. The batch carries fund identifiers,
          economics, and references that tie back to OmniGreen’s internal batch
          key for wires and exceptions.
        </p>

        <h2 style={{ color: "var(--text)", fontSize: "1.05rem", marginTop: "1.25rem" }}>
          3. File + wire are the dual trigger
        </h2>
        <p>
          OmniGreen transmits an <strong>order file</strong> to UMB and follows
          with a <strong>purchase import file</strong> that creates the omnibus
          mutual fund order. On the same calendar day, OmniGreen sends the{" "}
          <strong>bulk wire</strong> by the agreed cutoff (currently modeled at
          4:00 PM ET, with the order-file cutoff pending UMB confirmation of a
          potential 6:00 PM ET window).
        </p>

        <h2 style={{ color: "var(--text)", fontSize: "1.05rem", marginTop: "1.25rem" }}>
          4. Confirmations land on custodian files
        </h2>
        <p>
          UMB’s <strong>activity file</strong> provides processing signals; the{" "}
          <strong>position file</strong> carries confirmed omnibus positions.
          OmniGreen maps both into reconciliation states — the exact timestamps
          and field semantics remain open with UMB and are tracked in Element 6.
        </p>

        <h2 style={{ color: "var(--text)", fontSize: "1.05rem", marginTop: "1.25rem" }}>
          5. Street-side omnibus and fund settlement
        </h2>
        <p>
          The omnibus order participates in standard mutual fund settlement
          rails (transfer agent / NSCC patterns depending on share class). This
          layer is invisible to OmniGreen’s end clients but governs when cash and
          shares finally match at the omnibus.
        </p>

        <h2 style={{ color: "var(--text)", fontSize: "1.05rem", marginTop: "1.25rem" }}>
          6. Books &amp; records close the loop
        </h2>
        <p>
          OmniGreen allocates omnibus results back to subaccounts, publishes
          positions through the API, and preserves an audit trail from client
          instruction → file → wire → custodian confirmation → internal
          allocation. Any mismatch triggers the operational playbooks captured
          as requirements in Element 2.
        </p>
      </article>
    </div>
  );
}
