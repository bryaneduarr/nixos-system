import { join } from "node:path";
import { type ExtensionAPI, getAgentDir } from "@earendil-works/pi-coding-agent";
import { collectSessionStats } from "../../services/sessions/stats/collect-session-stats.service.ts";
import { formatSessionStats } from "../../services/sessions/stats/format-session-stats.service.ts";

const DEFAULT_STATS_DAYS = 7;
const DAY_MS = 86_400_000;

function requestedDays(args: string): number {
  const days = Number.parseInt(args.trim(), 10);
  return Number.isInteger(days) && days > 0 ? days : DEFAULT_STATS_DAYS;
}

export function registerSessionStatsCommand(pi: ExtensionAPI): void {
  pi.registerCommand("session-stats", {
    description: "Show token, tool, and cost statistics for recent sessions: /session-stats [days]",
    handler: async (args, ctx) => {
      const days = requestedDays(args);
      const stats = await collectSessionStats(join(getAgentDir(), "sessions"), Date.now() - days * DAY_MS);
      ctx.ui.notify(formatSessionStats(stats, days), "info");
    },
  });
}
