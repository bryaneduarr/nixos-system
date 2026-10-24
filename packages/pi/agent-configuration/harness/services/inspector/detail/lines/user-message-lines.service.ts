import { MESSAGE_ACTIVITY_NAME } from "../../../../constants/activity/record/activity-entry.constant.ts";
import { BLANK_DETAIL_LINE } from "../../../../constants/inspector/detail/detail-line.constant.ts";
import { NO_TEXT_LABEL } from "../../../../constants/inspector/detail/label.constant.ts";
import { THEME_ACCENT } from "../../../../constants/split-view/theme-color.constant.ts";
import { DOT_SEPARATOR } from "../../../../constants/text/separator.constant.ts";
import { activityStore } from "../../../../stores/activity/activity.store.ts";
import type { DetailLine } from "../../../../types/inspector/detail/detail-line.interface.ts";
import type { PseudoEntryLinesOptions } from "../../../../types/inspector/detail/pseudo-entry-lines-options.interface.ts";
import { isHarnessTool } from "../../../tools/active-tools/is-harness-tool.service.ts";
import { formatTime } from "../../format/format-time.service.ts";
import { boxedDetailLines } from "./boxed-detail-lines.service.ts";

export function userMessageLines({ entry, startedAt, rawText, width }: PseudoEntryLinesOptions): DetailLine[] {
  const entries = activityStore.all();
  const index = entries.indexOf(entry);
  const following = entries.slice(index + 1);
  const nextMessageIndex = following.findIndex((followingEntry) => followingEntry.toolName === MESSAGE_ACTIVITY_NAME);
  const group = nextMessageIndex < 0 ? following : following.slice(0, nextMessageIndex);
  const calls = group.filter((groupEntry) => isHarnessTool(groupEntry.toolName)).length;
  const callLabel = `${calls} tool call${calls === 1 ? "" : "s"}`;

  return [
    {
      text: `${callLabel} after this message${DOT_SEPARATOR}${formatTime(startedAt)}`,
      color: THEME_ACCENT,
      bold: false,
    },
    BLANK_DETAIL_LINE,
    ...boxedDetailLines({ title: "user message", text: rawText || NO_TEXT_LABEL, color: THEME_ACCENT, width }),
  ];
}
