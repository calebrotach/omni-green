import type { RequirementPhase } from "@/types";

export type PhaseColorTheme = {
  /** Mermaid subgraph (dark diagram) */
  mermaidFill: string;
  mermaidStroke: string;
  /** Swimlane column header on light print-style card */
  swimlaneHeaderBg: string;
  swimlaneHeaderText: string;
  /** Left stripe / accents */
  accent: string;
  /** Light wash over swimlane body cells (hex with alpha) */
  swimlaneCellWash: string;
  /** Requirements page panel (dark UI) */
  darkPanelTint: string;
};

export const REQUIREMENT_PHASES_ORDER: RequirementPhase[] = [
  "Order intake",
  "Submission & files",
  "Wire & funding",
  "Confirmation & positions",
  "Settlement & books",
  "Client experience & API",
  "Account structure & custody",
];

const THEMES: Record<RequirementPhase, PhaseColorTheme> = {
  "Order intake": {
    mermaidFill: "#152642",
    mermaidStroke: "#3b82f6",
    swimlaneHeaderBg: "#1d4ed8",
    swimlaneHeaderText: "#eff6ff",
    accent: "#3b82f6",
    swimlaneCellWash: "rgba(59, 130, 246, 0.14)",
    darkPanelTint: "rgba(59, 130, 246, 0.14)",
  },
  "Submission & files": {
    mermaidFill: "#2e1065",
    mermaidStroke: "#a78bfa",
    swimlaneHeaderBg: "#5b21b6",
    swimlaneHeaderText: "#f5f3ff",
    accent: "#8b5cf6",
    swimlaneCellWash: "rgba(139, 92, 246, 0.14)",
    darkPanelTint: "rgba(139, 92, 246, 0.14)",
  },
  "Wire & funding": {
    mermaidFill: "#422006",
    mermaidStroke: "#fbbf24",
    swimlaneHeaderBg: "#b45309",
    swimlaneHeaderText: "#fffbeb",
    accent: "#f59e0b",
    swimlaneCellWash: "rgba(245, 158, 11, 0.16)",
    darkPanelTint: "rgba(245, 158, 11, 0.14)",
  },
  "Confirmation & positions": {
    mermaidFill: "#064e3b",
    mermaidStroke: "#34d399",
    swimlaneHeaderBg: "#047857",
    swimlaneHeaderText: "#ecfdf5",
    accent: "#10b981",
    swimlaneCellWash: "rgba(16, 185, 129, 0.14)",
    darkPanelTint: "rgba(16, 185, 129, 0.14)",
  },
  "Settlement & books": {
    mermaidFill: "#3f0f1a",
    mermaidStroke: "#fb7185",
    swimlaneHeaderBg: "#be123c",
    swimlaneHeaderText: "#fff1f2",
    accent: "#f43f5e",
    swimlaneCellWash: "rgba(244, 63, 94, 0.12)",
    darkPanelTint: "rgba(244, 63, 94, 0.12)",
  },
  "Client experience & API": {
    mermaidFill: "#0c4a6e",
    mermaidStroke: "#38bdf8",
    swimlaneHeaderBg: "#0369a1",
    swimlaneHeaderText: "#f0f9ff",
    accent: "#0ea5e9",
    swimlaneCellWash: "rgba(14, 165, 233, 0.14)",
    darkPanelTint: "rgba(14, 165, 233, 0.14)",
  },
  "Account structure & custody": {
    mermaidFill: "#1e293b",
    mermaidStroke: "#94a3b8",
    swimlaneHeaderBg: "#475569",
    swimlaneHeaderText: "#f8fafc",
    accent: "#64748b",
    swimlaneCellWash: "rgba(100, 116, 139, 0.18)",
    darkPanelTint: "rgba(100, 116, 139, 0.16)",
  },
};

export function getPhaseTheme(phase: RequirementPhase): PhaseColorTheme {
  return THEMES[phase];
}

/** Cards (e.g. questions with no linked requirements yet). */
export const NEUTRAL_TRACE_THEME = {
  accent: "#64748b",
  darkPanelTint: "rgba(100, 116, 139, 0.14)",
} as const;
