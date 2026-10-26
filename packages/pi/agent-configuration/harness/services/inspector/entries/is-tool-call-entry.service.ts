import {
  API_ERROR_ACTIVITY_NAME,
  WARNING_ACTIVITY_NAME,
} from "../../../constants/activity/record/activity-entry.constant.ts";
import { isPseudoEntryTool } from "./is-pseudo-entry-tool.service.ts";

const NOTICE_ENTRY_TOOLS: ReadonlySet<string> = new Set([WARNING_ACTIVITY_NAME, API_ERROR_ACTIVITY_NAME]);

export function isToolCallEntry(tool: string): boolean {
  return !isPseudoEntryTool(tool) && !NOTICE_ENTRY_TOOLS.has(tool);
}
