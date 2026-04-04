import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";

const nav = [
  { to: "/flow", label: "Trade execution flow" },
  { to: "/requirements", label: "Requirements by flow step" },
  { to: "/mapping", label: "File ↔ API mapping" },
  { to: "/narrative", label: "From order to books" },
  { to: "/accounts", label: "Account relationships" },
  { to: "/questions", label: "Open questions & decisions" },
];

export function Layout() {
  const exportSnapshot = useAppStore((s) => s.exportSnapshot);
  const importSnapshot = useAppStore((s) => s.importSnapshot);
  const resetWorkspace = useAppStore((s) => s.resetWorkspace);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [importText, setImportText] = useState("");
  const mainWide = pathname === "/flow";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "1rem 1.5rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "1rem",
          background: "var(--bg-elevated)",
        }}
      >
        <div style={{ flex: "1 1 200px" }}>
          <div style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>OmniGreen</div>
          <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            Omni execution workspace · UMB evergreen-style flow
          </div>
        </div>
        <nav
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.35rem",
            alignItems: "center",
          }}
        >
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                padding: "0.35rem 0.65rem",
                borderRadius: 8,
                fontSize: "0.85rem",
                border: "1px solid var(--border)",
                background: isActive ? "#1a2e24" : "transparent",
                color: isActive ? "var(--text)" : "var(--muted)",
                textDecoration: "none",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              const blob = new Blob([exportSnapshot()], {
                type: "application/json",
              });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `omni-green-workspace-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(a.href);
            }}
          >
            Export JSON
          </button>
          <label className="btn-ghost" style={{ cursor: "pointer", margin: 0 }}>
            Import JSON
            <input
              type="file"
              accept="application/json"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                f.text().then((t) => {
                  importSnapshot(t);
                  navigate("/requirements");
                });
                e.target.value = "";
              }}
            />
          </label>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              if (
                confirm(
                  "Reset all workspace data to seed content? This cannot be undone.",
                )
              ) {
                resetWorkspace();
                navigate("/flow");
              }
            }}
          >
            Reset
          </button>
        </div>
      </header>
      <textarea
        aria-label="Paste JSON import"
        placeholder="Or paste a collaborator JSON export here and click Apply import…"
        value={importText}
        onChange={(e) => setImportText(e.target.value)}
        style={{
          margin: "0.5rem 1.5rem 0",
          minHeight: 56,
          resize: "vertical",
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: "var(--bg)",
          color: "var(--text)",
          padding: "0.5rem 0.65rem",
          fontFamily: "var(--mono)",
          fontSize: "0.75rem",
          display: importText ? "block" : "none",
        }}
      />
      {importText ? (
        <div style={{ padding: "0 1.5rem 0.5rem" }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              importSnapshot(importText);
              setImportText("");
              navigate("/requirements");
            }}
          >
            Apply import
          </button>
        </div>
      ) : null}
      <main
        style={{
          flex: 1,
          padding: "1.5rem",
          maxWidth: mainWide ? "none" : 1200,
          width: "100%",
          margin: "0 auto",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
