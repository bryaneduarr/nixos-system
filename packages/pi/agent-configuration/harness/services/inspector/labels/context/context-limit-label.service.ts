import type { SubagentModel } from "../../../../types/activity/parsing/subagent/subagent-model.interface.ts";
import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";
import { formatTokens } from "../../format/format-tokens.service.ts";
import { readContextLimit } from "./read-context-limit.service.ts";

export function contextLimitLabel(model: ValueState<SubagentModel>): string {
  const limit = readContextLimit(model);
  return limit.state === "present" ? `/${formatTokens(limit.value)}` : "";
}
