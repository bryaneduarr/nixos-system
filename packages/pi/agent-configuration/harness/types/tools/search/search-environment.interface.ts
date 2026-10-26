import type { BackendToolExecutor } from "../backends/backend-tool-executor.interface.ts";
import type { ToolCancellation } from "../process/tool-cancellation.interface.ts";

/** What the host provides to one search call. */
export interface SearchEnvironment {
  /** Directory the search runs from. */
  readonly cwd: string;
  /** Runs language-server, fff, and tree-sitter tools. */
  readonly backend: BackendToolExecutor;
  /** Whether the caller can abort the search. */
  readonly cancellation: ToolCancellation;
}
