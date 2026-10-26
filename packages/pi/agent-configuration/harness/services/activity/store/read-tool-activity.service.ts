import { activityStore } from "../../../stores/activity/activity.store.ts";
import type { ToolActivityLookup } from "../../../types/activity/store/tool-activity-lookup.interface.ts";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";

export function readToolActivity(toolCall: ValueState<string>): ToolActivityLookup {
  if (toolCall.state === "absent") return { found: false };
  return activityStore.lookup(toolCall.value);
}
