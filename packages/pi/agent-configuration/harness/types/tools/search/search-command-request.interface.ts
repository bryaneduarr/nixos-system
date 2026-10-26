import type { ToolCancellation } from "../process/tool-cancellation.interface.ts";
import type { SearchScope } from "./search-scope.interface.ts";

/** A search that runs one external command. */
export interface SearchCommandRequest {
  /** Directory the command runs from. */
  readonly cwd: string;
  /** Text, filename, pattern, or commit text the command looks for. */
  readonly query: string;
  /** Location the command is limited to. */
  readonly scope: SearchScope;
  /** Whether the caller can abort the command. */
  readonly cancellation: ToolCancellation;
}
