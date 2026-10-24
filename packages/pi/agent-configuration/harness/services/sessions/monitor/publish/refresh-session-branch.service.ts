import { BRANCH_REFRESH_INTERVAL_MS } from "../../../../constants/sessions/monitor/monitor.constant.ts";
import type { SessionMonitorState } from "../../../../types/sessions/monitor/session-monitor-state.interface.ts";
import { readGitBranch } from "./read-git-branch.service.ts";

export async function refreshSessionBranch(state: SessionMonitorState, cwd: string): Promise<void> {
  const isBranchStale = Date.now() - state.branchUpdatedAt >= BRANCH_REFRESH_INTERVAL_MS;
  if (!isBranchStale) return;
  state.branch = await readGitBranch(cwd);
  state.branchUpdatedAt = Date.now();
}
