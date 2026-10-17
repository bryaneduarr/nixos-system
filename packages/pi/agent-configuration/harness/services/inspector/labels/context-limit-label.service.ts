import type { SubagentModel } from "../../../types/activity/subagent-model.interface.ts";
import type { ValueState } from "../../../types/activity/value-state.interface.ts";
import { formatTokens } from "./format-tokens.service.ts";
import { readContextLimit } from "./read-context-limit.service.ts";

export function contextLimitLabel(model: ValueState<SubagentModel>): string {
  const limit = readContextLimit(model);
  return limit.state === "present" ? `/${formatTokens(limit.value)}` : "";
}
