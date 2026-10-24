import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SubagentProgressListener } from "../../registry/subagent-progress-listener.interface.ts";
import type { TaskRequest } from "./task-request.interface.ts";

/** Inputs that run one subagent task to completion. */
export interface RunTaskInput {
  /** Identifier of the subagent run. */
  readonly id: string;
  /** Validated request the worker carries out. */
  readonly request: TaskRequest;
  /** Parent context that supplies the working directory, model, and system prompt. */
  readonly ctx: ExtensionContext;
  /** Signal that aborts the worker when the parent cancels. */
  readonly signal: AbortSignal;
  /** Receives each new progress snapshot. */
  readonly onProgress: SubagentProgressListener;
}
