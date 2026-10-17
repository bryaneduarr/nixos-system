import { DECIMAL_SECONDS_LIMIT_MS, MILLISECONDS_PER_SECOND } from "../../../constants/inspector/format.constant.ts";

export function formatDuration(ms: number): string {
  if (ms < MILLISECONDS_PER_SECOND) return `${ms}ms`;

  const seconds = ms / MILLISECONDS_PER_SECOND;
  const precision = ms < DECIMAL_SECONDS_LIMIT_MS ? 1 : 0;
  return `${seconds.toFixed(precision)}s`;
}
