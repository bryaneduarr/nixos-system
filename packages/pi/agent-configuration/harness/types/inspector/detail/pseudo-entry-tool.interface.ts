import type {
  MESSAGE_ACTIVITY_NAME,
  REPLY_ACTIVITY_NAME,
  THINKING_ACTIVITY_NAME,
  TOKENS_ACTIVITY_NAME,
  UPDATE_ACTIVITY_NAME,
} from "../../../constants/activity/record/activity-entry.constant.ts";

/** Tool name of an entry that is not a tool call: a user message, an agent update or reply, thinking, or token usage. */
export type PseudoEntryTool =
  | typeof MESSAGE_ACTIVITY_NAME
  | typeof UPDATE_ACTIVITY_NAME
  | typeof REPLY_ACTIVITY_NAME
  | typeof THINKING_ACTIVITY_NAME
  | typeof TOKENS_ACTIVITY_NAME;
