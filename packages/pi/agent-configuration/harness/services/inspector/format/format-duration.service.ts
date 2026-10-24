import { DECIMAL_SECONDS_LIMIT_MS, DURATION_PART_WIDTH } from "../../../constants/inspector/format/format.constant.ts";
import {
  MILLISECONDS_PER_SECOND,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
} from "../../../constants/time/time-unit.constant.ts";

function padPart(part: number): string {
  return String(part).padStart(DURATION_PART_WIDTH, "0");
}

export function formatDuration(ms: number): string {
  if (ms < MILLISECONDS_PER_SECOND) return `${ms}ms`;

  const seconds = ms / MILLISECONDS_PER_SECOND;
  if (seconds < SECONDS_PER_MINUTE) {
    const precision = ms < DECIMAL_SECONDS_LIMIT_MS ? 1 : 0;
    return `${seconds.toFixed(precision)}s`;
  }

  const wholeSeconds = Math.floor(seconds);
  const hours = Math.floor(wholeSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((wholeSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const remainingSeconds = padPart(wholeSeconds % SECONDS_PER_MINUTE);
  if (hours === 0) return `${minutes}m ${remainingSeconds}s`;
  return `${hours}h ${padPart(minutes)}m ${remainingSeconds}s`;
}
