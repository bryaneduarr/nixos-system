import type { ToolActivity } from "../../../types/activity/store/tool-activity.interface.ts";

export function readSubagentElapsed(entry: ToolActivity): number {
  const endTime = entry.endedAt.state === "present" ? entry.endedAt.value : Date.now();
  return Math.max(0, endTime - entry.startedAt);
}
