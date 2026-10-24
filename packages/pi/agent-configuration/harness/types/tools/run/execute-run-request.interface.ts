import type { ToolCancellation } from "../process/tool-cancellation.interface.ts";
import type { RunParameters } from "./run-parameters.interface.ts";

/** One call of the run tool with the session it runs in. */
export interface ExecuteRunRequest {
  /** Session directory; relative run directories resolve against it. */
  readonly cwd: string;
  /** Input of the run tool after argument repair. */
  readonly parameters: RunParameters;
  /** Whether the caller can abort the command. */
  readonly cancellation: ToolCancellation;
}
