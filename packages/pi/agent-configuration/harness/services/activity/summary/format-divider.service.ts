import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { MUTED_COLOR } from "../../../constants/activity/summary-label.constant.ts";
import { DIVIDER_FILL, MIN_DIVIDER_WIDTH } from "../../../constants/activity/summary-layout.constant.ts";
import type { SummaryTheme } from "../../../types/activity/summary/summary-theme.interface.ts";

export function formatDivider(theme: SummaryTheme, label: string, width: number, prefix: string): string {
  if (width < MIN_DIVIDER_WIDTH) {
    return truncateToWidth(DIVIDER_FILL, Math.max(1, width), "", true);
  }
  const suffix = " ";
  const labelWidth = Math.max(1, width - visibleWidth(prefix) - 1);
  const clippedLabel = truncateToWidth(label, labelWidth, "", true);
  const fillWidth = Math.max(0, width - visibleWidth(prefix) - visibleWidth(clippedLabel) - visibleWidth(suffix));
  return `${theme.fg(MUTED_COLOR, prefix)}${clippedLabel}${theme.fg(MUTED_COLOR, `${suffix}${DIVIDER_FILL.repeat(fillWidth)}`)}`;
}
