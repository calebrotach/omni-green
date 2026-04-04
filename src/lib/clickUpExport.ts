import type { FlowNode, Requirement } from "@/types";
import { stripFlowMarkers } from "@/lib/requirementText";

const EPIC_DEFAULT_NAME = "OmniGreen × UMB — Execution requirements";

export type ClickUpStoryExport = {
  id: string;
  name: string;
  description: string;
  status: string;
  category: string;
  phase: string;
  flow_step_titles: string[];
  flow_node_ids: string[];
  client_notes: string;
  cpo_notes: string;
};

export type ClickUpBundle = {
  exported_at: string;
  format_version: 1;
  epic: {
    name: string;
    description: string;
  };
  import_hint: string;
  user_stories: ClickUpStoryExport[];
};

function storyDescription(r: Requirement, flowById: Map<string, FlowNode>): string {
  const parts: string[] = [];
  const body = stripFlowMarkers(r.body).trim();
  if (body) parts.push(body);
  const steps = r.linkedFlowNodeIds
    .map((id) => flowById.get(id))
    .filter(Boolean) as FlowNode[];
  if (steps.length) {
    parts.push(
      "",
      "---",
      "Linked flow steps (Trade execution flow / diagram metadata):",
      ...steps.map(
        (n) =>
          `• ${n.title} — ${n.summary} (Timing: ${n.timingNote}; ${n.actor} / ${n.systemOrChannel})`,
      ),
    );
  }
  if (r.clientNotes.trim()) {
    parts.push("", "---", "Client notes:", r.clientNotes.trim());
  }
  if (r.cpoNotes.trim()) {
    parts.push("", "---", "CPO notes:", r.cpoNotes.trim());
  }
  return parts.join("\n").trim();
}

export function buildClickUpBundle(
  requirements: Requirement[],
  flowNodes: FlowNode[],
  epicName = EPIC_DEFAULT_NAME,
): ClickUpBundle {
  const flowById = new Map(flowNodes.map((n) => [n.id, n]));
  const user_stories: ClickUpStoryExport[] = requirements.map((r) => {
    const steps = r.linkedFlowNodeIds
      .map((id) => flowById.get(id))
      .filter(Boolean) as FlowNode[];
    return {
      id: r.id,
      name: r.title,
      description: storyDescription(r, flowById),
      status: r.status,
      category: r.category,
      phase: r.phase,
      flow_step_titles: steps.map((n) => n.title),
      flow_node_ids: [...r.linkedFlowNodeIds],
      client_notes: r.clientNotes,
      cpo_notes: r.cpoNotes,
    };
  });

  return {
    exported_at: new Date().toISOString(),
    format_version: 1,
    epic: {
      name: epicName,
      description:
        "Requirements exported from OmniGreen workspace. Create this item as an Epic in ClickUp, then add each user_story as a task (or Story task type). Use flow_step_titles as a custom field or tags for traceability.",
    },
    import_hint:
      "Use the CSV in Excel or ClickUp Import (Tasks). Map columns to ClickUp fields; set Parent to the Epic after import, or use ClickUp’s bulk editor. JSON is for Zapier, Make, or custom API scripts.",
    user_stories,
  };
}

function csvEscape(value: string): string {
  const s = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Flat rows for ClickUp CSV import: Parent Task Name groups under epic name;
 * Story rows use epic name as parent when your workspace supports hierarchy import.
 */
export function buildClickUpCsv(bundle: ClickUpBundle): string {
  const headers = [
    "Parent Task Name",
    "Task Name",
    "Task Description",
    "Status",
    "Category",
    "Phase",
    "Flow steps",
    "External ID",
  ];
  const lines = [headers.join(",")];
  lines.push(
    [
      "",
      csvEscape(bundle.epic.name),
      csvEscape(bundle.epic.description),
      "",
      "",
      "",
      "",
      "epic",
    ].join(","),
  );
  for (const s of bundle.user_stories) {
    lines.push(
      [
        csvEscape(bundle.epic.name),
        csvEscape(s.name),
        csvEscape(s.description),
        csvEscape(s.status),
        csvEscape(s.category),
        csvEscape(s.phase),
        csvEscape(s.flow_step_titles.join(" | ")),
        csvEscape(s.id),
      ].join(","),
    );
  }
  return lines.join("\n");
}

export function buildClickUpMarkdown(bundle: ClickUpBundle): string {
  const lines: string[] = [
    `# Epic: ${bundle.epic.name}`,
    "",
    bundle.epic.description,
    "",
    "---",
    "",
  ];
  for (const s of bundle.user_stories) {
    lines.push(
      `## ${s.name}`,
      "",
      `- **Status:** ${s.status}`,
      `- **Category:** ${s.category}`,
      `- **Phase:** ${s.phase}`,
      `- **Flow steps:** ${s.flow_step_titles.length ? s.flow_step_titles.join(" · ") : "—"}`,
      `- **ID:** \`${s.id}\``,
      "",
      "### Description",
      "",
      s.description,
      "",
    );
  }
  return lines.join("\n");
}

export function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
