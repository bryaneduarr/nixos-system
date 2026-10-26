import { SCRIPT_FAILED_PATTERN } from "../../../../constants/tool-rendering/codemode/codemode-display.constant.ts";
import type { HarnessVisualState } from "../../../../types/tool-rendering/presentation/harness-presentation.interface.ts";

export function codemodeVisualState(text: string, isPartial: boolean, isError: boolean): HarnessVisualState {
  if (isPartial) return "running";
  return isError || SCRIPT_FAILED_PATTERN.test(text) ? "error" : "success";
}
