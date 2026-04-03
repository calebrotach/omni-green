import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  FieldMappingRow,
  FlowNode,
  FlowPresentationComment,
  OpenQuestion,
  Requirement,
  RequirementPhase,
  RequirementStatus,
} from "@/types";
import {
  DEFAULT_REQUIREMENT_CATEGORIES,
  initialFlowEdges,
  initialFlowNodes,
  initialPurchaseMapping,
  initialQuestions,
  initialRedemptionMapping,
  initialRequirements,
} from "@/data/seed";

function syncRequirementBodies(
  requirements: Requirement[],
  nodes: FlowNode[],
): Requirement[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return requirements.map((req) => {
    let body = req.body;
    for (const nid of req.linkedFlowNodeIds) {
      const node = byId.get(nid);
      if (!node) continue;
      const startTag = `<!--FLOW:${nid}-->`;
      const endTag = `<!--/FLOW-->`;
      const start = body.indexOf(startTag);
      const end = body.indexOf(endTag);
      if (start === -1 || end === -1 || end <= start) continue;
      const inner = `\n**From execution flow (${node.title}):** ${node.summary} *Timing:* ${node.timingNote}\n`;
      body =
        body.slice(0, start + startTag.length) + inner + body.slice(end);
    }
    return {
      ...req,
      body,
      lastSyncedAt: new Date().toISOString(),
    };
  });
}

export function buildFlowchartMermaid(
  nodes: FlowNode[],
  edges: { from: string; to: string }[],
  selectedMermaidId: string | null,
): string {
  const lines: string[] = ["flowchart TB"];
  lines.push(
    "  classDef default fill:#141a20,stroke:#3dd68c,color:#e8eef4;",
  );
  lines.push(
    "  classDef dim fill:#0f1318,stroke:#243040,color:#8fa3b8;",
  );
  lines.push(
    "  classDef sel fill:#1a2e24,stroke:#3dd68c,color:#e8eef4,stroke-width:2px;",
  );

  const phases: RequirementPhase[] = [
    "Order intake",
    "Submission & files",
    "Wire & funding",
    "Confirmation & positions",
    "Settlement & books",
    "Client experience & API",
    "Account structure & custody",
  ];

  for (const phase of phases) {
    const inPhase = nodes.filter((n) => n.phase === phase);
    if (inPhase.length === 0) continue;
    const slug = phase.replace(/[^a-zA-Z0-9]+/g, "_");
    lines.push(`  subgraph SG_${slug}["${phase}"]`);
    for (const n of inPhase) {
      const label = `${n.title}<br/><small>${n.timingNote.replace(/"/g, "'")}</small>`;
      lines.push(
        `    ${n.mermaidId}["${label.replace(/\n/g, " ")}"]`,
      );
    }
    lines.push("  end");
  }

  for (const e of edges) {
    lines.push(`  ${e.from} --> ${e.to}`);
  }

  if (selectedMermaidId) {
    const selected = nodes.find((n) => n.mermaidId === selectedMermaidId);
    const others = nodes
      .filter((n) => n.mermaidId !== selectedMermaidId)
      .map((n) => n.mermaidId)
      .join(",");
    if (selected) {
      lines.push(`  class ${selected.mermaidId} sel`);
    }
    if (others.length > 0) {
      lines.push(`  class ${others} dim`);
    }
  }

  return lines.join("\n");
}

interface AppState {
  requirementCategories: string[];
  flowNodes: FlowNode[];
  flowEdges: { from: string; to: string }[];
  requirements: Requirement[];
  purchaseMapping: FieldMappingRow[];
  redemptionMapping: FieldMappingRow[];
  questions: OpenQuestion[];
  presentationComments: FlowPresentationComment[];
  selectedFlowNodeId: string | null;

  setSelectedFlowNodeId: (id: string | null) => void;
  addPresentationComment: (author: string, body: string) => void;
  removePresentationComment: (id: string) => void;
  updateFlowNode: (id: string, patch: Partial<FlowNode>) => void;
  updateRequirement: (id: string, patch: Partial<Requirement>) => void;
  addRequirement: (
    r: Omit<Requirement, "id"> & { id?: string },
  ) => void;
  addRequirementCategory: (name: string) => void;

  updateMappingRow: (
    kind: "purchase" | "redemption",
    index: number,
    patch: Partial<FieldMappingRow>,
  ) => void;
  addMappingRow: (kind: "purchase" | "redemption") => void;

  updateQuestion: (id: string, patch: Partial<OpenQuestion>) => void;
  addQuestion: () => void;

  exportSnapshot: () => string;
  importSnapshot: (json: string) => void;
  resetWorkspace: () => void;
}

const seedState = () => ({
  requirementCategories: [...DEFAULT_REQUIREMENT_CATEGORIES],
  flowNodes: structuredClone(initialFlowNodes),
  flowEdges: structuredClone(initialFlowEdges),
  requirements: syncRequirementBodies(
    structuredClone(initialRequirements),
    structuredClone(initialFlowNodes),
  ),
  purchaseMapping: structuredClone(initialPurchaseMapping),
  redemptionMapping: structuredClone(initialRedemptionMapping),
  questions: structuredClone(initialQuestions),
  presentationComments: [] as FlowPresentationComment[],
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...seedState(),
      selectedFlowNodeId: null,

      setSelectedFlowNodeId: (id) => set({ selectedFlowNodeId: id }),

      addPresentationComment: (author, body) =>
        set((s) => {
          const t = body.trim();
          if (!t) return s;
          const c: FlowPresentationComment = {
            id: `pc-${crypto.randomUUID?.() ?? String(Date.now())}`,
            author: author.trim() || "Anonymous",
            body: t,
            createdAt: new Date().toISOString(),
          };
          return { presentationComments: [...s.presentationComments, c] };
        }),

      removePresentationComment: (id) =>
        set((s) => ({
          presentationComments: s.presentationComments.filter((c) => c.id !== id),
        })),

      updateFlowNode: (id, patch) =>
        set((s) => {
          const flowNodes = s.flowNodes.map((n) =>
            n.id === id ? { ...n, ...patch } : n,
          );
          return {
            flowNodes,
            requirements: syncRequirementBodies(s.requirements, flowNodes),
          };
        }),

      updateRequirement: (id, patch) =>
        set((s) => ({
          requirements: s.requirements.map((r) =>
            r.id === id ? { ...r, ...patch } : r,
          ),
        })),

      addRequirement: (r) =>
        set((s) => {
          const id =
            r.id ??
            `req-${crypto.randomUUID?.() ?? String(Date.now()).slice(-8)}`;
          const req: Requirement = {
            id,
            category: r.category,
            phase: r.phase,
            title: r.title,
            body: r.body,
            status: r.status,
            clientNotes: r.clientNotes,
            cpoNotes: r.cpoNotes,
            linkedFlowNodeIds: r.linkedFlowNodeIds,
          };
          return { requirements: [...s.requirements, req] };
        }),

      addRequirementCategory: (name) =>
        set((s) =>
          s.requirementCategories.includes(name)
            ? s
            : { requirementCategories: [...s.requirementCategories, name] },
        ),

      updateMappingRow: (kind, index, patch) =>
        set((s) => {
          if (kind === "purchase") {
            const rows = [...s.purchaseMapping];
            rows[index] = { ...rows[index]!, ...patch };
            return { purchaseMapping: rows };
          }
          const rows = [...s.redemptionMapping];
          rows[index] = { ...rows[index]!, ...patch };
          return { redemptionMapping: rows };
        }),

      addMappingRow: (kind) =>
        set((s) => {
          const empty: FieldMappingRow = {
            fileField: "",
            description: "",
            apiField: "",
            notes: "",
          };
          if (kind === "purchase") {
            return {
              purchaseMapping: [...s.purchaseMapping, empty],
            };
          }
          return { redemptionMapping: [...s.redemptionMapping, empty] };
        }),

      updateQuestion: (id, patch) =>
        set((s) => ({
          questions: s.questions.map((q) =>
            q.id === id
              ? {
                  ...q,
                  ...patch,
                  updatedAt: new Date().toISOString(),
                }
              : q,
          ),
        })),

      addQuestion: () =>
        set((s) => ({
          questions: [
            ...s.questions,
            {
              id: `q-${crypto.randomUUID?.() ?? String(Date.now())}`,
              topic: "General",
              question: "",
              status: "open",
              decision: "",
              owner: "",
              linkedRequirementIds: [],
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      exportSnapshot: () => {
        const {
          requirementCategories,
          flowNodes,
          flowEdges,
          requirements,
          purchaseMapping,
          redemptionMapping,
          questions,
          presentationComments,
        } = get();
        return JSON.stringify(
          {
            requirementCategories,
            flowNodes,
            flowEdges,
            requirements,
            purchaseMapping,
            redemptionMapping,
            questions,
            presentationComments,
          },
          null,
          2,
        );
      },

      importSnapshot: (json) => {
        try {
          const data = JSON.parse(json) as Partial<AppState>;
          set({
            requirementCategories:
              data.requirementCategories ?? get().requirementCategories,
            flowNodes: data.flowNodes ?? get().flowNodes,
            flowEdges: data.flowEdges ?? get().flowEdges,
            requirements: data.requirements ?? get().requirements,
            purchaseMapping: data.purchaseMapping ?? get().purchaseMapping,
            redemptionMapping:
              data.redemptionMapping ?? get().redemptionMapping,
            questions: data.questions ?? get().questions,
            presentationComments:
              data.presentationComments ?? get().presentationComments,
          });
        } catch {
          /* ignore */
        }
      },

      resetWorkspace: () => set({ ...seedState(), selectedFlowNodeId: null }),
    }),
    {
      name: "omni-green-workspace",
      partialize: (s) => ({
        requirementCategories: s.requirementCategories,
        flowNodes: s.flowNodes,
        flowEdges: s.flowEdges,
        requirements: s.requirements,
        purchaseMapping: s.purchaseMapping,
        redemptionMapping: s.redemptionMapping,
        questions: s.questions,
        presentationComments: s.presentationComments,
      }),
    },
  ),
);

export function statusesList(): RequirementStatus[] {
  return ["draft", "proposed", "agreed", "deferred", "rejected"];
}
