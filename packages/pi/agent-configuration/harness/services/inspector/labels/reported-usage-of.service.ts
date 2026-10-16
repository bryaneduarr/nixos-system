import type { SubagentUsage } from "../../../types/activity/subagent-usage.interface.ts";
import type { ToolActivityUsage } from "../../../types/activity/tool-activity-usage.interface.ts";

export function reportedUsageOf(usage: ToolActivityUsage): SubagentUsage | undefined {
  return usage.usageState === "reported" ? usage.usage : undefined;
}
