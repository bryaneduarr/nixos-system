import { EMPTY_VALUE_LABEL } from "../../../../constants/inspector/detail/label.constant.ts";
import type { ToolActivityUsage } from "../../../../types/activity/parsing/subagent/tool-activity-usage.interface.ts";
import { formatTokens } from "../../format/format-tokens.service.ts";

export function spentTokensLabel(usage: ToolActivityUsage): string {
  return usage.usageState === "reported" ? formatTokens(usage.usage.totalTokens) : EMPTY_VALUE_LABEL;
}
