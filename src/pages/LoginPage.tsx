import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";

const DEFAULT_PASSWORD = "omnigreen";

export function LoginPage() {
  const navigate = useNavigate();
  const authenticated = useAppStore((s) => s.authenticated);
  const login = useAppStore((s) => s.login);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const expected =
    import.meta.env.VITE_APP_PASSWORD?.trim() || DEFAULT_PASSWORD;

  if (authenticated) {
    return <Navigate to="/flow" replace />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "min(400px, 100%)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "2rem",
          background: "var(--bg-elevated)",
        }}
      >
        <h1 style={{ margin: "0 0 0.25rem", fontSize: "1.5rem" }}>OmniGreen</h1>
        <p style={{ margin: "0 0 1.5rem", color: "var(--muted)", fontSize: "0.95rem" }}>
          Password-protected workspace for execution flow, requirements, and
          decisions with your CPO.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (login(password, expected)) {
              setError(null);
              navigate("/flow", { replace: true });
            } else {
              setError("Incorrect password.");
            }
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: "0.8rem",
              color: "var(--muted)",
              marginBottom: "0.35rem",
            }}
          >
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "0.65rem 0.75rem",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text)",
              marginBottom: "1rem",
            }}
          />
          {error ? (
            <p style={{ color: "var(--danger)", fontSize: "0.9rem", margin: "0 0 1rem" }}>
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn-primary" style={{ width: "100%" }}>
            Enter workspace
          </button>
        </form>
        <p style={{ margin: "1.25rem 0 0", fontSize: "0.75rem", color: "var(--muted)" }}>
          Set <code>VITE_APP_PASSWORD</code> in <code>.env.local</code> for production.
          Default dev password is <code>{DEFAULT_PASSWORD}</code>.
        </p>
      </div>
    </div>
  );
}
