import {
  FFF_FIND_TOOL,
  LSP_WORKSPACE_SYMBOLS_TOOL,
  TREE_SITTER_CALLERS_TOOL,
  TREE_SITTER_DEFINITION_TOOL,
} from "../../../constants/tools/backends/backend-tools.constant.ts";
import type { BackendSearchResult } from "../../../types/tools/search/backend-search-result.interface.ts";
import type { SearchRequest } from "../../../types/tools/search/search-request.interface.ts";
import { callBackendTool } from "../backends/call-backend-tool.service.ts";

function scopePath(request: SearchRequest): Record<string, string> {
  return request.scope.kind === "path" ? { path: request.scope.path } : {};
}

async function labelled(label: string, pending: ReturnType<typeof callBackendTool>): Promise<BackendSearchResult> {
  const result = await pending;
  return result.found ? { found: true, label, text: result.text } : { found: false };
}

async function searchSymbolDefinitions(request: SearchRequest): Promise<BackendSearchResult> {
  const { query } = request;
  const languageServer = await labelled(
    "symbol (language server)",
    callBackendTool(request.backend, LSP_WORKSPACE_SYMBOLS_TOOL, { query }),
  );
  if (languageServer.found) return languageServer;

  return labelled(
    "symbol (tree-sitter)",
    callBackendTool(request.backend, TREE_SITTER_DEFINITION_TOOL, { name: query }),
  );
}

export function backendSearch(request: SearchRequest): Promise<BackendSearchResult> {
  const { kind, query } = request;
  switch (kind) {
    case "file":
      return labelled(
        "file (fff)",
        callBackendTool(request.backend, FFF_FIND_TOOL, {
          pattern: query,
          limit: request.limit,
          ...scopePath(request),
        }),
      );
    case "symbol":
      return searchSymbolDefinitions(request);
    case "references":
      return labelled(
        "references (tree-sitter callers)",
        callBackendTool(request.backend, TREE_SITTER_CALLERS_TOOL, { name: query, ...scopePath(request) }),
      );
    case "auto":
    case "text":
    case "structural":
    case "history":
      return Promise.resolve({ found: false });
    default:
      return kind satisfies never;
  }
}
