import { CARD_TITLE_FALLBACK } from "../../../constants/subagents/card/card.constant.ts";
import type { ToolActivityLookup } from "../../../types/activity/store/tool-activity-lookup.interface.ts";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";
import type { TaskProgress } from "../../../types/subagents/tasks/progress/task-progress.interface.ts";

function progressTitle(current: ValueState<TaskProgress>): ValueState<string> {
  if (current.state === "absent") return { state: "absent" };

  return { state: "present", value: current.value.title };
}

function recordedTitle(activityLookup: ToolActivityLookup): ValueState<string> {
  if (!activityLookup.found) return { state: "absent" };

  const candidate = activityLookup.entry.args.title;
  return typeof candidate === "string" ? { state: "present", value: candidate } : { state: "absent" };
}

export function resolveCardTitle(
  current: ValueState<TaskProgress>,
  title: string,
  activityLookup: ToolActivityLookup,
): string {
  const candidates: readonly ValueState<string>[] = [
    progressTitle(current),
    { state: "present", value: title },
    recordedTitle(activityLookup),
  ];

  for (const candidate of candidates) {
    if (candidate.state === "present" && candidate.value.trim().length > 0) return candidate.value;
  }

  return CARD_TITLE_FALLBACK;
}
