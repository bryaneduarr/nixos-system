import {
  OPENCODE_MONTHLY_WINDOW_LABEL,
  OPENCODE_MONTHLY_WINDOW_NAME,
  OPENCODE_ROLLING_WINDOW_LABEL,
  OPENCODE_ROLLING_WINDOW_NAME,
  OPENCODE_WEEKLY_WINDOW_LABEL,
  OPENCODE_WEEKLY_WINDOW_NAME,
} from "../../../constants/providers/opencode/opencode-provider.constant.ts";
import type { OpenCodeUsageResponse } from "../../../types/providers/opencode/opencode-usage-response.interface.ts";
import type { UsageWindow } from "../../../types/usage/provider-usage.interface.ts";
import { convertUsedToRemainingPercent } from "../../usage/remaining-percent/convert-used-to-remaining-percent.service.ts";

function describeWindowLabel(windowName: string): string {
  if (windowName === OPENCODE_ROLLING_WINDOW_NAME) return OPENCODE_ROLLING_WINDOW_LABEL;
  if (windowName === OPENCODE_WEEKLY_WINDOW_NAME) return OPENCODE_WEEKLY_WINDOW_LABEL;
  if (windowName === OPENCODE_MONTHLY_WINDOW_NAME) return OPENCODE_MONTHLY_WINDOW_LABEL;
  return windowName;
}

export function buildOpenCodeUsageWindows(usage: OpenCodeUsageResponse["usage"]): readonly UsageWindow[] {
  return Object.entries(usage).map(([windowName, window]) => ({
    label: describeWindowLabel(windowName),
    percentRemaining: convertUsedToRemainingPercent(window.percent),
    resetsAt: new Date(window.resetsAt).toISOString(),
  }));
}
