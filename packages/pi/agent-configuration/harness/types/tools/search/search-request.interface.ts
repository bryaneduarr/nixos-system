import type { BackendToolExecutor } from "../backends/backend-tool-executor.interface.ts";
import type { GitHistoryRequest } from "./git-history-request.interface.ts";
import type { SearchKind } from "./search-kind.interface.ts";

/** A search with its strategy, scope, result limit, and cancellation. */
export interface SearchRequest extends GitHistoryRequest {
  /** Strategy of the search. */
  readonly kind: SearchKind;
  /** Runs language-server, fff, and tree-sitter tools that answer before the built-in search. */
  readonly backend: BackendToolExecutor;
}
