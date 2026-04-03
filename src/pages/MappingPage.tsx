import { useAppStore } from "@/store/useAppStore";

export function MappingPage() {
  const purchaseMapping = useAppStore((s) => s.purchaseMapping);
  const redemptionMapping = useAppStore((s) => s.redemptionMapping);
  const updateMappingRow = useAppStore((s) => s.updateMappingRow);
  const addMappingRow = useAppStore((s) => s.addMappingRow);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>File ↔ API mapping</h1>
      <p style={{ color: "var(--muted)", maxWidth: "65ch" }}>
        Starter grids connect custodian purchase/redemption import fields to the
        OmniGreen API surface your clients will use. Names are placeholders
        until UMB file specs and your API contract are finalized (use Allfunds
        distributor documentation as a parallel for field lifecycle and
        enumerations).
      </p>

      <section style={{ marginTop: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "0.5rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Purchase import file</h2>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => addMappingRow("purchase")}
          >
            Add row
          </button>
        </div>
        <MappingTable
          rows={purchaseMapping}
          onChange={(i, field, value) =>
            updateMappingRow("purchase", i, { [field]: value })
          }
        />
      </section>

      <section style={{ marginTop: "2rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "0.5rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Redemption file</h2>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => addMappingRow("redemption")}
          >
            Add row
          </button>
        </div>
        <MappingTable
          rows={redemptionMapping}
          onChange={(i, field, value) =>
            updateMappingRow("redemption", i, { [field]: value })
          }
        />
      </section>
    </div>
  );
}

function MappingTable({
  rows,
  onChange,
}: {
  rows: {
    fileField: string;
    description: string;
    apiField: string;
    notes: string;
  }[];
  onChange: (
    index: number,
    field: "fileField" | "description" | "apiField" | "notes",
    value: string,
  ) => void;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>File field</th>
            <th>Description</th>
            <th>API field</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>
                <input
                  style={cellInput}
                  value={row.fileField}
                  onChange={(e) => onChange(i, "fileField", e.target.value)}
                />
              </td>
              <td>
                <textarea
                  style={{ ...cellInput, minHeight: 52, resize: "vertical" }}
                  value={row.description}
                  onChange={(e) => onChange(i, "description", e.target.value)}
                />
              </td>
              <td>
                <input
                  style={cellInput}
                  value={row.apiField}
                  onChange={(e) => onChange(i, "apiField", e.target.value)}
                />
              </td>
              <td>
                <textarea
                  style={{ ...cellInput, minHeight: 52, resize: "vertical" }}
                  value={row.notes}
                  onChange={(e) => onChange(i, "notes", e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const cellInput = {
  width: "100%",
  padding: "0.35rem 0.4rem",
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--bg)",
  color: "var(--text)",
  fontFamily: "var(--mono)",
  fontSize: "0.8rem",
} as const;
