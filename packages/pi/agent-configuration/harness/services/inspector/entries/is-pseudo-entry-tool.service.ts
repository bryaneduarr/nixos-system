import {
  MESSAGE_ACTIVITY_NAME,
  REPLY_ACTIVITY_NAME,
  THINKING_ACTIVITY_NAME,
  TOKENS_ACTIVITY_NAME,
  UPDATE_ACTIVITY_NAME,
} from "../../../constants/activity/record/activity-entry.constant.ts";
import type { PseudoEntryTool } from "../../../types/inspector/detail/pseudo-entry-tool.interface.ts";

const PSEUDO_ENTRY_TOOLS: ReadonlySet<string> = new Set<PseudoEntryTool>([
  MESSAGE_ACTIVITY_NAME,
  UPDATE_ACTIVITY_NAME,
  REPLY_ACTIVITY_NAME,
  THINKING_ACTIVITY_NAME,
  TOKENS_ACTIVITY_NAME,
]);

export function isPseudoEntryTool(tool: string): tool is PseudoEntryTool {
  return PSEUDO_ENTRY_TOOLS.has(tool);
}
