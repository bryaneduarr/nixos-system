import { EMPTY_VALUE_LABEL } from "../../../constants/inspector/label.constant.ts";
import type { ToolActivityUsage } from "../../../types/activity/tool-activity-usage.interface.ts";
import { formatTokens } from "./format-tokens.service.ts";

export function spentTokensLabel(usage: ToolActivityUsage): string {
  return usage.usageState === "reported" ? formatTokens(usage.usage.totalTokens) : EMPTY_VALUE_LABEL;
}
