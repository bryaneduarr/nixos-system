import { DEFAULT_STATS_DAYS } from "../../../constants/sessions/stats/session-stats.constant.ts";

export function resolveStatsDays(args: string): number {
  const days = Number.parseInt(args.trim(), 10);
  return Number.isInteger(days) && days > 0 ? days : DEFAULT_STATS_DAYS;
}
