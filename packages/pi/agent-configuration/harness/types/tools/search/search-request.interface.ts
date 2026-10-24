import type { BackendToolExecutor } from "../backends/backend-tool-executor.interface.ts";
import type { ToolCancellation } from "../process/tool-cancellation.interface.ts";

/** Strategy of a search. */
type SearchKind = "auto" | "text" | "file" | "symbol" | "references" | "structural" | "history";

/** Where a search looks: the whole workspace or one path. */
export type SearchScope = PathSearchScope | WorkspaceSearchScope;

/** A search limited to one file or directory. */
interface PathSearchScope {
  /** Marks a path-limited search. */
  readonly kind: "path";
  /** File or directory to search. */
  readonly path: string;
}

/** A search over the whole workspace. */
interface WorkspaceSearchScope {
  /** Marks a workspace-wide search. */
  readonly kind: "workspace";
}

/** A search with its strategy, scope, result limit, and cancellation. */
export interface SearchRequest {
  /** Directory the search runs from. */
  readonly cwd: string;
  /** Text, filename, symbol, pattern, or commit text to find. */
  readonly query: string;
  /** Strategy of the search. */
  readonly kind: SearchKind;
  /** Location the search is limited to. */
  readonly scope: SearchScope;
  /** Maximum results per section. */
  readonly limit: number;
  /** Whether the caller can abort the search. */
  readonly cancellation: ToolCancellation;
  /** Runs language-server, fff, and tree-sitter tools that answer before the built-in search. */
  readonly backend: BackendToolExecutor;
}
