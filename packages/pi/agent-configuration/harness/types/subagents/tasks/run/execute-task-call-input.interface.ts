import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { ToolCancellation } from "../../../tools/process/tool-cancellation.interface.ts";
import type { SubagentProgressListener } from "../../registry/subagent-progress-listener.interface.ts";
import type { SubagentRegistry } from "../../registry/subagent-registry.interface.ts";
import type { TaskRequest } from "./task-request.interface.ts";

/** Inputs that carry out one task tool call through the subagent registry. */
export interface ExecuteTaskCallInput {
  /** Registry that starts and cancels the run. */
  readonly registry: SubagentRegistry;
  /** Validated request the worker carries out. */
  readonly request: TaskRequest;
  /** Parent context passed on to the worker. */
  readonly ctx: ExtensionContext;
  /** Whether the parent can abort the call. */
  readonly cancellation: ToolCancellation;
  /** Receives each new progress snapshot of the run. */
  readonly onProgress: SubagentProgressListener;
}
