import type { HarnessVisualState } from "../../../types/tool-rendering/presentation/harness-presentation.interface.ts";
import type { HarnessTool } from "../../../types/tools/active-tools/harness-tool.interface.ts";
import { resultFailed } from "./result-failed.service.ts";

export function resultVisualState(
  tool: HarnessTool,
  text: string,
  isPartial: boolean,
  isError: boolean,
): HarnessVisualState {
  if (isPartial) return "running";
  return isError || resultFailed(tool, text) ? "error" : "success";
}
