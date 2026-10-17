import type { ToolCancellation } from "../../../types/tools/process/tool-cancellation.interface.ts";

export function toToolCancellation(signal: AbortSignal | undefined): ToolCancellation {
  return signal === undefined ? { kind: "uncancellable" } : { kind: "abortable", signal };
}
