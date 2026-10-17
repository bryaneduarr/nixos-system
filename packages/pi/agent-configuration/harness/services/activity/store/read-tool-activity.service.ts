import type { ToolActivityLookup } from "../../../types/activity/tool-activity-lookup.interface.ts";
import type { ValueState } from "../../../types/activity/value-state.interface.ts";
import { activityStore } from "./shared-activity-store.service.ts";

export function readToolActivity(toolCall: ValueState<string>): ToolActivityLookup {
  if (toolCall.state === "absent") return { found: false };
  return activityStore.lookup(toolCall.value);
}
