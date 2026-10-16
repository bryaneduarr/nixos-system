import type { ToolCancellation } from "../process/tool-cancellation.interface.ts";

/** A shell command to run with its working directory, timeout, and cancellation. */
export interface RunRequest {
  /** Directory the command starts in; full output is stored under it. */
  readonly cwd: string;
  /** Shell command text. */
  readonly command: string;
  /** Milliseconds before the command is killed. */
  readonly timeoutMs: number;
  /** Whether the caller can abort the command. */
  readonly cancellation: ToolCancellation;
}
