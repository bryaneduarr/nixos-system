import { RUNNING_LABEL } from "../../../../constants/inspector/detail/heading.constant.ts";
import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";
import { formatDuration } from "../../format/format-duration.service.ts";
import { formatTime } from "../../format/format-time.service.ts";

export function detailTimingLabel(startedAt: number, endedAt: ValueState<number>): string {
  const endTime = endedAt.state === "present" ? endedAt.value : Date.now();
  const elapsed = formatDuration(Math.max(0, endTime - startedAt));
  const runningLabel = endedAt.state === "absent" ? RUNNING_LABEL : "";
  return `${formatTime(startedAt)}  ${elapsed}${runningLabel}`;
}
