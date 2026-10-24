import { CODEMODE_TOOL_NAME } from "./codemode.constant.ts";

export const LSP_DIAGNOSTICS_TOOL = "lsp_diagnostics";
export const LSP_WORKSPACE_SYMBOLS_TOOL = "lsp_workspace_symbols";
export const TREE_SITTER_DEFINITION_TOOL = "find_definition";
export const TREE_SITTER_CALLERS_TOOL = "find_callers";
export const FFF_FIND_TOOL = "find";

export const BACKEND_TOOLS = [
  LSP_DIAGNOSTICS_TOOL,
  LSP_WORKSPACE_SYMBOLS_TOOL,
  TREE_SITTER_DEFINITION_TOOL,
  TREE_SITTER_CALLERS_TOOL,
  FFF_FIND_TOOL,
] as const;

export const BACKEND_TIMEOUT_MS = 8000;

// Engines report empty searches and their own failures as ordinary text, not as tool errors.
export const BACKEND_NO_ANSWER_PATTERNS = [
  /^No (matches|files|symbols|definition|callers|callees)\b/,
  /^No LSP (workspace symbols|\w+ locations)\b/,
  /^\w+ failed: /,
] as const;

export const BUILTIN_MCP_TOOLS = [CODEMODE_TOOL_NAME, "tool_search"] as const;

export const MCP_TOOL_PREFIX = "mcp__";

export const DIAGNOSTIC_FILE_PATTERN = /\.[cm]?[jt]sx?$/;
