import { join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { SESSIONS_DIRECTORY_NAME } from "../../../constants/sessions/stats/session-stats.constant.ts";
import { MILLISECONDS_PER_DAY } from "../../../constants/time/time-unit.constant.ts";
import type { SessionStats } from "../../../types/sessions/stats/session-stats.interface.ts";
import { collectSessionStats } from "./collect-session-stats.service.ts";

export function collectRecentSessionStats(days: number): Promise<SessionStats> {
  return collectSessionStats(join(getAgentDir(), SESSIONS_DIRECTORY_NAME), Date.now() - days * MILLISECONDS_PER_DAY);
}
