import {
  BAR_ROW_FIXED_WIDTH,
  COLUMN_GAP,
  PERCENT_FIELD_WIDTH,
  SPACE,
} from "../../../constants/render/card-layout.constant.ts";
import { RESET_TIME_UNKNOWN_TEXT } from "../../../constants/render/card-text.constant.ts";
import type { CardRenderOptions } from "../../../types/render/usage-card.interface.ts";
import type { UsageWindow } from "../../../types/usage/provider-usage.interface.ts";
import { formatResetCountdown } from "../countdown/format-reset-countdown.service.ts";
import { buildUsageBar } from "./build-usage-bar.service.ts";
import { measureVisibleLength } from "./measure-visible-length.service.ts";
import { padVisibleText } from "./pad-visible-text.service.ts";
import { sanitizeCardText } from "./sanitize-card-text.service.ts";
import { truncateText } from "./truncate-text.service.ts";

function describeResetTime(resetsAt: string, now: Date): string {
  const countdown = formatResetCountdown({ resetsAt, now });
  return countdown.state === "formatted" ? countdown.text : RESET_TIME_UNKNOWN_TEXT;
}

function buildWindowLines(usageWindow: UsageWindow, labelWidth: number, options: CardRenderOptions): string[] {
  const percent = Math.round(usageWindow.percentRemaining);
  const label = padVisibleText(truncateText(usageWindow.label, labelWidth), labelWidth);
  const bar = buildUsageBar({ percent, colorEnabled: options.colorEnabled });
  const percentText = `${percent}%`.padStart(PERCENT_FIELD_WIDTH);
  const barRow = `${label}${COLUMN_GAP}${bar}${COLUMN_GAP}${percentText}`;
  const countdown = describeResetTime(usageWindow.resetsAt, options.now);
  const countdownRow = `${barRow}${COLUMN_GAP}${countdown}`;
  const fitsOnOneLine = measureVisibleLength(countdownRow) <= options.innerWidth;
  const indentedCountdown = `${SPACE.repeat(labelWidth + COLUMN_GAP.length)}${countdown}`;
  return fitsOnOneLine ? [countdownRow] : [barRow, truncateText(indentedCountdown, options.innerWidth)];
}

export function buildWindowRows(windows: readonly UsageWindow[], options: CardRenderOptions): readonly string[] {
  const sanitizedWindows = windows.map((usageWindow) => ({
    ...usageWindow,
    label: sanitizeCardText(usageWindow.label),
  }));
  const longestLabel = Math.max(0, ...sanitizedWindows.map((usageWindow) => measureVisibleLength(usageWindow.label)));
  const labelWidth = Math.min(longestLabel, options.innerWidth - BAR_ROW_FIXED_WIDTH);
  return sanitizedWindows.flatMap((usageWindow) => buildWindowLines(usageWindow, labelWidth, options));
}
