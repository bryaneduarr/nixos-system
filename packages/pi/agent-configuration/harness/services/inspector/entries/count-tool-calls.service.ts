import type { ToolActivity } from "../../../types/activity/store/tool-activity.interface.ts";
import { isToolCallEntry } from "./is-tool-call-entry.service.ts";

export function countToolCalls(entries: readonly ToolActivity[]): number {
  return entries.filter((entry) => isToolCallEntry(entry.toolName)).length;
}
