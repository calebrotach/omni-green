import mermaid from "mermaid";
import { useEffect, useRef, useState } from "react";

let mermaidReady = false;

function ensureMermaid() {
  if (mermaidReady) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "loose",
    fontFamily: "DM Sans, system-ui, sans-serif",
    flowchart: {
      curve: "basis",
      padding: 12,
      nodeSpacing: 28,
      rankSpacing: 40,
    },
  });
  mermaidReady = true;
}

type Props = {
  definition: string;
  className?: string;
  /** Taller viewport for slide-style flow pages */
  size?: "default" | "presentation";
};

let mermaidRenderSeq = 0;

export function MermaidChart({
  definition,
  className,
  size = "default",
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    ensureMermaid();
    const el = host.current;
    if (!el) return;

    let cancelled = false;
    const id = `mmd-${++mermaidRenderSeq}`;

    (async () => {
      try {
        const { svg } = await mermaid.render(id, definition);
        if (cancelled || !host.current) return;
        host.current.innerHTML = svg;
        setErr(null);
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Diagram error");
        }
      }
    })();

    return () => {
      cancelled = true;
      if (host.current) host.current.innerHTML = "";
    };
  }, [definition]);

  return (
    <div className={className}>
      {err ? (
        <p style={{ color: "var(--danger)", margin: 0 }}>{err}</p>
      ) : null}
      <div
        ref={host}
        className="mermaid-host"
        style={{
          overflow: "auto",
          maxHeight:
            size === "presentation"
              ? "min(88vh, 920px)"
              : "min(70vh, 720px)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: size === "presentation" ? "1.25rem" : "1rem",
          background: "var(--bg-elevated)",
        }}
      />
    </div>
  );
}
