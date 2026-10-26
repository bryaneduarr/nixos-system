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
