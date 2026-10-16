import type { ToolActivityLookup } from "../../../types/activity/tool-activity-lookup.interface.ts";
import { activityStore } from "./shared-activity-store.service.ts";

export function readToolActivity(toolCallId: string | undefined): ToolActivityLookup {
  if (toolCallId === undefined) return { found: false };
  return activityStore.lookup(toolCallId);
}
