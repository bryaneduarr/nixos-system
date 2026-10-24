import {
  MILLISECONDS_PER_SECOND,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
} from "../../../constants/time/time-unit.constant.ts";

export function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / MILLISECONDS_PER_SECOND));
  const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}
