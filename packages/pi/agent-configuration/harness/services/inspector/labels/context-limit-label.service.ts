import type { SubagentModel } from "../../../types/activity/subagent-model.interface.ts";
import { formatTokens } from "./format-tokens.service.ts";
import { readContextLimit } from "./read-context-limit.service.ts";

export function contextLimitLabel(model: SubagentModel | undefined): string {
  const limit = readContextLimit(model);
  return limit === undefined ? "" : `/${formatTokens(limit)}`;
}
