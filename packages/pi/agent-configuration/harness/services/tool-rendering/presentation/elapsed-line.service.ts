import type { Theme } from "@earendil-works/pi-coding-agent";
import { ELAPSED_TIME_LABEL } from "../../../constants/tool-rendering/elapsed-label.constant.ts";
import type { ToolActivity } from "../../../types/activity/tool-activity.interface.ts";
import { presentValue } from "../../activity/value/present-value.service.ts";

export function elapsedLine(entry: ToolActivity, theme: Theme): string {
  const elapsedMs = Math.max(0, (presentValue(entry.endedAt) ?? Date.now()) - entry.startedAt);
  const elapsedLabel = elapsedMs < 1000 ? `${elapsedMs} ms` : `${(elapsedMs / 1000).toFixed(1)} s`;
  return theme.fg("muted", `${ELAPSED_TIME_LABEL}${elapsedLabel}`);
}
