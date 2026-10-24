import { DECIMAL_PERCENT_LIMIT } from "../../../../constants/inspector/format/format.constant.ts";
import type { SubagentModel } from "../../../../types/activity/parsing/subagent/subagent-model.interface.ts";
import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";
import { readContextLimit } from "./read-context-limit.service.ts";

export function contextPercentLabel(tokens: ValueState<number>, model: ValueState<SubagentModel>): string {
  const limit = readContextLimit(model);
  if (tokens.state === "absent" || limit.state === "absent") {
    return "";
  }
  const percent = (tokens.value / limit.value) * 100;
  return ` (${percent < DECIMAL_PERCENT_LIMIT ? percent.toFixed(1) : Math.round(percent)}%)`;
}
