import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { DIVIDER_FILL, MIN_DIVIDER_WIDTH } from "../../../constants/activity/summary/summary-layout.constant.ts";
import { THEME_MUTED } from "../../../constants/split-view/theme-color.constant.ts";
import type { FormatDividerInput } from "../../../types/activity/summary/format-divider-input.interface.ts";

export function formatDivider(input: FormatDividerInput): string {
  const { theme, label, width, prefix } = input;
  if (width < MIN_DIVIDER_WIDTH) {
    return truncateToWidth(DIVIDER_FILL, Math.max(1, width), "", true);
  }
  const suffix = " ";
  const labelWidth = Math.max(1, width - visibleWidth(prefix) - 1);
  const clippedLabel = truncateToWidth(label, labelWidth, "", true);
  const fillWidth = Math.max(0, width - visibleWidth(prefix) - visibleWidth(clippedLabel) - visibleWidth(suffix));
  return `${theme.fg(THEME_MUTED, prefix)}${clippedLabel}${theme.fg(THEME_MUTED, `${suffix}${DIVIDER_FILL.repeat(fillWidth)}`)}`;
}
