import type { SubToolActivity } from "../../../types/activity/parsing/subagent/sub-tool-activity.interface.ts";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";

export function readRunningCallStart(calls: readonly SubToolActivity[]): ValueState<number> {
  const runningCall = calls.findLast((toolCall) => toolCall.status === "running");
  if (runningCall === undefined) return { state: "absent" };

  return { state: "present", value: runningCall.startedAt };
}
