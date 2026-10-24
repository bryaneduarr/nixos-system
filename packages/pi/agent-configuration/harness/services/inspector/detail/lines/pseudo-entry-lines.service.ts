import {
  MESSAGE_ACTIVITY_NAME,
  REPLY_ACTIVITY_NAME,
  TOKENS_ACTIVITY_NAME,
  UPDATE_ACTIVITY_NAME,
} from "../../../../constants/activity/record/activity-entry.constant.ts";
import { BLANK_DETAIL_LINE } from "../../../../constants/inspector/detail/detail-line.constant.ts";
import { THEME_ACCENT } from "../../../../constants/split-view/theme-color.constant.ts";
import type { DetailLine } from "../../../../types/inspector/detail/detail-line.interface.ts";
import type { PseudoEntryLinesOptions } from "../../../../types/inspector/detail/pseudo-entry-lines-options.interface.ts";
import { boxedDetailLines } from "./boxed-detail-lines.service.ts";
import { turnUsageDetail } from "./turn-usage-detail.service.ts";
import { userMessageLines } from "./user-message-lines.service.ts";

export function pseudoEntryLines(options: PseudoEntryLinesOptions): DetailLine[] {
  const { tool, entry, timing, rawText, width } = options;
  if (tool === MESSAGE_ACTIVITY_NAME) return userMessageLines(options);
  if (tool === UPDATE_ACTIVITY_NAME) {
    return [
      { text: `AGENT UPDATE  ${timing}`, color: THEME_ACCENT, bold: true },
      BLANK_DETAIL_LINE,
      ...boxedDetailLines({ title: "update", text: rawText, color: THEME_ACCENT, width }),
    ];
  }
  if (tool === REPLY_ACTIVITY_NAME) {
    return [
      { text: `REPLY  ${timing}`, color: THEME_ACCENT, bold: true },
      BLANK_DETAIL_LINE,
      ...boxedDetailLines({ title: "reply", text: rawText, color: THEME_ACCENT, width }),
    ];
  }
  if (tool === TOKENS_ACTIVITY_NAME) {
    return [
      { text: `TOKENS  ${timing}`, color: THEME_ACCENT, bold: true },
      BLANK_DETAIL_LINE,
      ...boxedDetailLines({ title: "usage", text: turnUsageDetail(entry.usage), color: THEME_ACCENT, width }),
    ];
  }
  return [
    { text: `THINKING  ${timing}`, color: THEME_ACCENT, bold: true },
    BLANK_DETAIL_LINE,
    ...boxedDetailLines({ title: "thinking", text: rawText || "(redacted)", color: THEME_ACCENT, width }),
  ];
}
