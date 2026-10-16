export const HARNESS_TOOLS = ["search", "read", "edit", "run"] as const;

export type HarnessTool = (typeof HARNESS_TOOLS)[number];

export function isHarnessTool(name: string): name is HarnessTool {
  return (HARNESS_TOOLS as readonly string[]).includes(name);
}

export const WORK_DIR = ".agent";

export const RUN_DIR = "runs";
export const EVIDENCE_DIR = "evidence";

export const MAX_TEXT_CHARS = 6000;
export const MAX_TEXT_LINES = 160;

export const DEFAULT_READ_LINES = 120;
export const LARGE_FILE_LINES = 250;
export const LARGE_FILE_BYTES = 12_000;
export const STRUCTURE_SYMBOL_LIMIT = 60;

export const DEFAULT_SEARCH_LIMIT = 20;
export const DEFAULT_RUN_TIMEOUT_MS = 120_000;
