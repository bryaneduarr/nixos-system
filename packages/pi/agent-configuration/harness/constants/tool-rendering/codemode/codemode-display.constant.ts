import type { CodemodeCallStatus } from "../../../types/tool-rendering/codemode/codemode-call.interface.ts";

export const CODEMODE_TARGET_FALLBACK = "Script";
export const CODEMODE_DEFAULT_VERB = "Running";
export const MAX_CODEMODE_TARGET_NAMES = 3;
export const MAX_CODEMODE_CALL_ROWS = 6;

export const CODEMODE_VERBS: readonly { readonly pattern: RegExp; readonly verb: string }[] = [
  { pattern: /search|find|query|list|grep/i, verb: "Searching" },
  { pattern: /fetch|get|read|view|open|load/i, verb: "Reading" },
  { pattern: /create|add|insert|write|update|edit|move|delete|append|send|set|post/i, verb: "Updating" },
];

export const CODEMODE_CALL_ICONS: Readonly<Record<CodemodeCallStatus, string>> = {
  running: "…",
  ok: "✓",
  error: "✗",
  cancelled: "⊘",
};

export const MCP_TOOL_PREFIX_PATTERN = /^mcp__.+?__/;
export const SCRIPT_TOOL_CALL_PATTERN = /\btools\.([A-Za-z_$][\w$]*)/g;
export const SCRIPT_HEADER_PATTERN = /^Script (completed|failed)\nWall time [\d.]+ seconds\nOutput:\n?/;
export const SCRIPT_FAILED_PATTERN = /^Script failed/;
export const SCRIPT_ERROR_LABEL = "Script error:";
