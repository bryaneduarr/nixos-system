import type { SubagentUsage } from "../../../types/activity/subagent-usage.interface.ts";
import { presentValue } from "../../activity/value/present-value.service.ts";

export function readCurrentTokens(usage: SubagentUsage): number | undefined {
  return presentValue(usage.contextTokens);
}
