import type { HarnessVisualState } from "../../../types/tool-rendering/presentation/harness-presentation.interface.ts";
import type { ResultVisualStateInput } from "../../../types/tool-rendering/presentation/result-visual-state-input.interface.ts";
import { resultFailed } from "./result-failed.service.ts";

export function resultVisualState({ tool, text, isPartial, isError }: ResultVisualStateInput): HarnessVisualState {
  if (isPartial) return "running";
  return isError || resultFailed(tool, text) ? "error" : "success";
}
