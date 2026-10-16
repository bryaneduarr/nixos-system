import { activityStore } from "../../../activity/store.ts";
import {
  MESSAGE_ACTIVITY_NAME,
  THINKING_ACTIVITY_NAME,
  UPDATE_ACTIVITY_NAME,
} from "../../../constants/activity/activity-entry.constant.ts";
import { BLANK_DETAIL_LINE } from "../../../constants/inspector/detail-line.constant.ts";
import { isHarnessTool } from "../../../tools/config.ts";
import type { ToolActivity } from "../../../types/activity/tool-activity.interface.ts";
import type { DetailLine } from "../../../types/inspector/detail/detail-line.interface.ts";
import { boxDetails } from "./box-details.service.ts";
import { formatTime } from "./format-time.service.ts";

function userMessageBody(entry: ToolActivity, startedAt: number, text: string, width: number): DetailLine[] {
  const entries = activityStore.all();
  const index = entries.indexOf(entry);
  const following = entries.slice(index + 1);
  const nextMessage = following.findIndex((item) => item.toolName === MESSAGE_ACTIVITY_NAME);
  const group = nextMessage < 0 ? following : following.slice(0, nextMessage);
  const calls = group.filter((item) => isHarnessTool(item.toolName)).length;
  const callLabel = `${calls} tool call${calls === 1 ? "" : "s"}`;

  return [
    { text: `${callLabel} after this message · ${formatTime(startedAt)}`, color: "accent", bold: false },
    BLANK_DETAIL_LINE,
    ...boxDetails("user message", text || "(no text)", "accent", width),
  ];
}

export function pseudoEntryLines(
  tool: string,
  entry: ToolActivity,
  startedAt: number,
  timing: string,
  rawText: string,
  width: number,
): DetailLine[] | undefined {
  if (tool === MESSAGE_ACTIVITY_NAME) return userMessageBody(entry, startedAt, rawText, width);
  if (tool === UPDATE_ACTIVITY_NAME) {
    return [
      { text: `AGENT UPDATE  ${timing}`, color: "accent", bold: true },
      BLANK_DETAIL_LINE,
      ...boxDetails("update", rawText, "accent", width),
    ];
  }
  if (tool === THINKING_ACTIVITY_NAME) {
    return [
      { text: `THINKING  ${timing}`, color: "accent", bold: true },
      BLANK_DETAIL_LINE,
      ...boxDetails("thinking", rawText || "(redacted)", "accent", width),
    ];
  }
  return undefined;
}
