import { NO_GIT_BRANCH } from "../../../../constants/sessions/registry/registry.constant.ts";
import type { SessionMonitorState } from "../../../../types/sessions/monitor/session-monitor-state.interface.ts";

export function createSessionMonitorState(): SessionMonitorState {
  return {
    historyEver: false,
    compacting: false,
    agentActive: false,
    userBash: false,
    open: false,
    branch: NO_GIT_BRANCH,
    branchUpdatedAt: 0,
    session: { state: "absent" },
  };
}
