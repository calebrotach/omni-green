import type { FlowNode, RequirementPhase } from "@/types";

const PHASE_ORDER: RequirementPhase[] = [
  "Order intake",
  "Submission & files",
  "Wire & funding",
  "Confirmation & positions",
  "Settlement & books",
  "Client experience & API",
  "Account structure & custody",
];

function phaseIdx(p: RequirementPhase): number {
  const i = PHASE_ORDER.indexOf(p);
  return i === -1 ? 999 : i;
}

/** Order flow nodes in execution order when possible (Kahn topological sort on edges). */
export function orderFlowNodes(
  nodes: FlowNode[],
  edges: { from: string; to: string }[],
): FlowNode[] {
  const ids = new Set(nodes.map((n) => n.id));
  const indeg = new Map<string, number>();
  const outs = new Map<string, string[]>();
  for (const n of nodes) {
    indeg.set(n.id, 0);
    outs.set(n.id, []);
  }
  for (const e of edges) {
    if (!ids.has(e.from) || !ids.has(e.to)) continue;
    outs.get(e.from)!.push(e.to);
    indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1);
  }

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const queue = nodes
    .filter((n) => indeg.get(n.id) === 0)
    .sort(
      (a, b) =>
        phaseIdx(a.phase) - phaseIdx(b.phase) || a.title.localeCompare(b.title),
    );

  const ordered: FlowNode[] = [];
  const seen = new Set<string>();

  while (queue.length) {
    const n = queue.shift()!;
    if (seen.has(n.id)) continue;
    seen.add(n.id);
    ordered.push(n);
    for (const to of outs.get(n.id) ?? []) {
      const next = (indeg.get(to) ?? 0) - 1;
      indeg.set(to, next);
      if (next === 0) {
        const node = byId.get(to);
        if (node) {
          queue.push(node);
          queue.sort(
            (a, b) =>
              phaseIdx(a.phase) - phaseIdx(b.phase) ||
              a.title.localeCompare(b.title),
          );
        }
      }
    }
  }

  for (const n of nodes) {
    if (!seen.has(n.id)) ordered.push(n);
  }
  return ordered;
}
