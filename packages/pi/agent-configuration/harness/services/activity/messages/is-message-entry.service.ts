import { MESSAGE_ACTIVITY_NAME } from "../../../constants/activity/record/activity-entry.constant.ts";
import type { ToolActivity } from "../../../types/activity/store/tool-activity.interface.ts";

export function isMessageEntry(entry: ToolActivity, messageNumber: number): boolean {
  return entry.toolName === MESSAGE_ACTIVITY_NAME && entry.args.number === messageNumber;
}
