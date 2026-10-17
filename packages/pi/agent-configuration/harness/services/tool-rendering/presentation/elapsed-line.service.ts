import type { Theme } from "@earendil-works/pi-coding-agent";
import { ELAPSED_TIME_LABEL } from "../../../constants/tool-rendering/elapsed-label.constant.ts";
import type { ToolActivity } from "../../../types/activity/tool-activity.interface.ts";

export function elapsedLine(entry: ToolActivity, theme: Theme): string {
  const endedAt = entry.endedAt.state === "present" ? entry.endedAt.value : Date.now();
  const elapsedMs = Math.max(0, endedAt - entry.startedAt);
  const elapsedLabel = elapsedMs < 1000 ? `${elapsedMs} ms` : `${(elapsedMs / 1000).toFixed(1)} s`;
  return theme.fg("muted", `${ELAPSED_TIME_LABEL}${elapsedLabel}`);
}
