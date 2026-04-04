/** Remove FLOW-synced regions (HTML comments + inner markdown). */
export function stripFlowSyncedRegions(body: string): string {
  return body
    .replace(/<!--FLOW:[^>]+-->[\s\S]*?<!--\/FLOW-->/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Text outside auto-sync FLOW blocks (for editing “additional detail” only). */
export const extractFreeTextOutsideFlowMarkers = stripFlowSyncedRegions;

/** Strip synced blocks for previews / exports (same as region removal). */
export const stripFlowMarkers = stripFlowSyncedRegions;

/** Plain one-line preview (no markdown). */
export function requirementPreview(body: string, maxLen = 140): string {
  const raw = stripFlowSyncedRegions(body)
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
  const plain = raw.replace(/\s+/g, " ").trim();
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen - 1)}…`;
}
