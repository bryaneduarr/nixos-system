import type { Theme } from "@earendil-works/pi-coding-agent";
import { THEME_MUTED } from "../../../constants/split-view/theme-color.constant.ts";
import { ELAPSED_TIME_LABEL } from "../../../constants/tool-rendering/details/elapsed-label.constant.ts";
import type { ToolActivity } from "../../../types/activity/store/tool-activity.interface.ts";

export function elapsedLine(entry: ToolActivity, theme: Theme): string {
  const endedAt = entry.endedAt.state === "present" ? entry.endedAt.value : Date.now();
  const elapsedMs = Math.max(0, endedAt - entry.startedAt);
  const elapsedLabel = elapsedMs < 1000 ? `${elapsedMs} ms` : `${(elapsedMs / 1000).toFixed(1)} s`;
  return theme.fg(THEME_MUTED, `${ELAPSED_TIME_LABEL}${elapsedLabel}`);
}
