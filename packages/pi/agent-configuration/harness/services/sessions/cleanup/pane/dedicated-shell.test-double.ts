import type { PaneCloseTarget } from "../../../../types/sessions/cleanup/pane/pane-close-target.interface.ts";

export const cleanupRow = {
  owned: true,
  historyEver: false,
  cleanupSafe: true,
  processStart: "boot:123",
  pid: 123,
  socket: "/tmp/test-herdr.sock",
  pane: "w2:p3",
  tab: "w2:t2",
  workspace: "w2",
};

export const shellTarget: PaneCloseTarget = {
  pid: cleanupRow.pid,
  processStart: cleanupRow.processStart,
  pane: cleanupRow.pane,
  tab: cleanupRow.tab,
  workspace: cleanupRow.workspace,
  shell: { required: false },
};

export function createShellPane() {
  return {
    tab: { tab_id: cleanupRow.tab, workspace_id: cleanupRow.workspace, pane_count: 2 },
    pane: {
      pane_id: cleanupRow.pane,
      tab_id: cleanupRow.tab,
      workspace_id: cleanupRow.workspace,
      agent: null,
      agent_status: "idle",
    },
    processInfo: { pane_id: cleanupRow.pane, shell_pid: 4321, foreground_processes: [{ pid: 4321, name: "bash" }] },
  };
}
