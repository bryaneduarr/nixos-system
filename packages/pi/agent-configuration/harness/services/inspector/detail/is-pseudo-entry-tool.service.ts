import {
  MESSAGE_ACTIVITY_NAME,
  THINKING_ACTIVITY_NAME,
  UPDATE_ACTIVITY_NAME,
} from "../../../constants/activity/activity-entry.constant.ts";
import type { PseudoEntryTool } from "../../../types/inspector/detail/pseudo-entry-tool.interface.ts";

export function isPseudoEntryTool(tool: string): tool is PseudoEntryTool {
  return tool === MESSAGE_ACTIVITY_NAME || tool === UPDATE_ACTIVITY_NAME || tool === THINKING_ACTIVITY_NAME;
}
