import type { SubagentModel } from "../../../types/activity/subagent-model.interface.ts";
import { readContextLimit } from "./read-context-limit.service.ts";

export function contextPercentLabel(tokens: number | undefined, model: SubagentModel | undefined): string {
  const limit = readContextLimit(model);
  if (tokens === undefined || limit === undefined) {
    return "";
  }
  const percent = (tokens / limit) * 100;
  return ` (${percent < 10 ? percent.toFixed(1) : Math.round(percent)}%)`;
}
