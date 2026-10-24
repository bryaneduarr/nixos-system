import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
  SESSION_STATS_COMMAND_NAME,
  SESSION_STATS_DESCRIPTION,
} from "../../constants/sessions/stats/session-stats.constant.ts";
import { collectRecentSessionStats } from "../../services/sessions/stats/collect-recent-session-stats.service.ts";
import { formatSessionStats } from "../../services/sessions/stats/format-session-stats.service.ts";
import { resolveStatsDays } from "../../services/sessions/stats/resolve-stats-days.service.ts";

export function registerSessionStatsCommand(pi: ExtensionAPI): void {
  pi.registerCommand(SESSION_STATS_COMMAND_NAME, {
    description: SESSION_STATS_DESCRIPTION,
    handler: async (args, ctx) => {
      const days = resolveStatsDays(args);
      ctx.ui.notify(formatSessionStats(await collectRecentSessionStats(days), days), "info");
    },
  });
}
