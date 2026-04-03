import type { FlowNode } from "@/types";

export function flowMarkerBlock(node: FlowNode): string {
  return `<!--FLOW:${node.id}-->\n**From execution flow (${node.title}):** ${node.summary} *Timing:* ${node.timingNote}\n<!--/FLOW-->`;
}

export function buildBodyForNewRequirement(
  nodes: FlowNode[],
  linkedIds: string[],
  freeText: string,
): string {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const blocks = linkedIds
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((n) => flowMarkerBlock(n!));
  const head = blocks.join("\n\n");
  if (!head) return freeText.trim();
  if (!freeText.trim()) return head;
  return `${head}\n\n${freeText.trim()}`;
}
