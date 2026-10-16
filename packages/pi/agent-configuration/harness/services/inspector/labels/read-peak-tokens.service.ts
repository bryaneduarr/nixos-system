import type { SubagentUsage } from "../../../types/activity/subagent-usage.interface.ts";
import { presentValue } from "../../activity/value/present-value.service.ts";
import { readCurrentTokens } from "./read-current-tokens.service.ts";

export function readPeakTokens(usage: SubagentUsage): number | undefined {
  return presentValue(usage.maxContextTokens) ?? readCurrentTokens(usage);
}
