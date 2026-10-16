import { EMPTY_VALUE_LABEL } from "../../../constants/inspector/label.constant.ts";
import type { SubagentModel } from "../../../types/activity/subagent-model.interface.ts";
import type { ValueState } from "../../../types/activity/value-state.interface.ts";
import { formatTokens } from "./format-tokens.service.ts";

export function contextWindowLabel(model: ValueState<SubagentModel>): string {
  if (model.state === "absent" || model.value.contextWindow.state === "absent") return EMPTY_VALUE_LABEL;
  return model.value.contextWindow.value ? formatTokens(model.value.contextWindow.value) : EMPTY_VALUE_LABEL;
}
