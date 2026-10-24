import {
  MESSAGE_ACTIVITY_NAME,
  REPLY_ACTIVITY_NAME,
  TOKENS_ACTIVITY_NAME,
  UPDATE_ACTIVITY_NAME,
} from "../../../../constants/activity/activity-entry.constant.ts";
import { BLANK_DETAIL_LINE } from "../../../../constants/inspector/detail-line.constant.ts";
import { NO_TEXT_LABEL } from "../../../../constants/inspector/label.constant.ts";
import { activityStore } from "../../../../stores/activity/activity.store.ts";
import type { ToolActivity } from "../../../../types/activity/store/tool-activity.interface.ts";
import type { DetailLine } from "../../../../types/inspector/detail/detail-line.interface.ts";
import type { PseudoEntryTool } from "../../../../types/inspector/detail/pseudo-entry-tool.interface.ts";
import { isHarnessTool } from "../../../tools/active-tools/is-harness-tool.service.ts";
import { formatTime } from "../../format/format-time.service.ts";
import { boxedDetailLines } from "./boxed-detail-lines.service.ts";
import { turnUsageDetail } from "./turn-usage-detail.service.ts";

function userMessageBody(entry: ToolActivity, startedAt: number, text: string, width: number): DetailLine[] {
  const entries = activityStore.all();
  const index = entries.indexOf(entry);
  const following = entries.slice(index + 1);
  const nextMessageIndex = following.findIndex((followingEntry) => followingEntry.toolName === MESSAGE_ACTIVITY_NAME);
  const group = nextMessageIndex < 0 ? following : following.slice(0, nextMessageIndex);
  const calls = group.filter((groupEntry) => isHarnessTool(groupEntry.toolName)).length;
  const callLabel = `${calls} tool call${calls === 1 ? "" : "s"}`;

  return [
    { text: `${callLabel} after this message · ${formatTime(startedAt)}`, color: "accent", bold: false },
    BLANK_DETAIL_LINE,
    ...boxedDetailLines("user message", text || NO_TEXT_LABEL, "accent", width),
  ];
}

export function pseudoEntryLines(
  tool: PseudoEntryTool,
  entry: ToolActivity,
  startedAt: number,
  timing: string,
  rawText: string,
  width: number,
): DetailLine[] {
  if (tool === MESSAGE_ACTIVITY_NAME) return userMessageBody(entry, startedAt, rawText, width);
  if (tool === UPDATE_ACTIVITY_NAME) {
    return [
      { text: `AGENT UPDATE  ${timing}`, color: "accent", bold: true },
      BLANK_DETAIL_LINE,
      ...boxedDetailLines("update", rawText, "accent", width),
    ];
  }
  if (tool === REPLY_ACTIVITY_NAME) {
    return [
      { text: `REPLY  ${timing}`, color: "accent", bold: true },
      BLANK_DETAIL_LINE,
      ...boxedDetailLines("reply", rawText, "accent", width),
    ];
  }
  if (tool === TOKENS_ACTIVITY_NAME) {
    return [
      { text: `TOKENS  ${timing}`, color: "accent", bold: true },
      BLANK_DETAIL_LINE,
      ...boxedDetailLines("usage", turnUsageDetail(entry.usage), "accent", width),
    ];
  }
  return [
    { text: `THINKING  ${timing}`, color: "accent", bold: true },
    BLANK_DETAIL_LINE,
    ...boxedDetailLines("thinking", rawText || "(redacted)", "accent", width),
  ];
}
