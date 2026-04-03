export type RequirementPhase =
  | "Order intake"
  | "Submission & files"
  | "Wire & funding"
  | "Confirmation & positions"
  | "Settlement & books"
  | "Client experience & API"
  | "Account structure & custody";

export type RequirementStatus =
  | "draft"
  | "proposed"
  | "agreed"
  | "deferred"
  | "rejected";

export type DecisionStatus = "open" | "decided" | "parked";

export interface FlowNode {
  id: string;
  mermaidId: string;
  title: string;
  phase: RequirementPhase;
  summary: string;
  /** Cutoff or SLA text shown in diagram label and synced into linked requirements */
  timingNote: string;
  actor: string;
  systemOrChannel: string;
  linkedRequirementIds: string[];
}

export interface Requirement {
  id: string;
  category: string;
  phase: RequirementPhase;
  title: string;
  body: string;
  status: RequirementStatus;
  /** Free-form collaboration notes */
  clientNotes: string;
  cpoNotes: string;
  linkedFlowNodeIds: string[];
  lastSyncedAt?: string;
}

export interface FieldMappingRow {
  fileField: string;
  description: string;
  apiField: string;
  notes: string;
}

export interface OpenQuestion {
  id: string;
  topic: string;
  question: string;
  status: DecisionStatus;
  decision: string;
  owner: string;
  linkedRequirementIds: string[];
  updatedAt: string;
}

/** Thread on the trade execution flow (presentation) page */
export interface FlowPresentationComment {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}
