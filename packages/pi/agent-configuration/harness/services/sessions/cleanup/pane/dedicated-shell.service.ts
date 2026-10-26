import { SHELL_NAME_PATTERN } from "../../../../constants/sessions/cleanup/cleanup-target.constant.ts";
import type { PaneCloseTarget } from "../../../../types/sessions/cleanup/pane/pane-close-target.interface.ts";
import type { PaneInspection } from "../../../../types/sessions/cleanup/pane/pane-inspection.interface.ts";
import { isUnknownArray } from "../../../values/is-unknown-array.service.ts";
import { isObjectRecord } from "../../herdr/response/is-object-record.service.ts";

export function dedicatedShell(target: PaneCloseTarget, inspection: PaneInspection): boolean {
  const { tab, pane, processInfo } = inspection;
  if (!isObjectRecord(tab) || !isObjectRecord(pane) || !isObjectRecord(processInfo)) return false;
  const isTabOfTarget = tab.tab_id === target.tab && tab.workspace_id === target.workspace;
  const isPaneOfTarget =
    pane.pane_id === target.pane && pane.tab_id === target.tab && pane.workspace_id === target.workspace;
  const hasNoAgent = !pane.agent && !pane.agent_session;
  const isProcessInfoOfPane = processInfo.pane_id === target.pane;
  if (!isTabOfTarget || !isPaneOfTarget || !hasNoAgent || !isProcessInfoOfPane) return false;
  if (target.shell.required && processInfo.shell_pid !== target.shell.pid) return false;
  const processes = processInfo.foreground_processes;
  if (!isUnknownArray(processes) || processes.length !== 1) return false;
  const shell: unknown = processes[0];
  if (!isObjectRecord(shell)) return false;
  return shell.pid === processInfo.shell_pid && typeof shell.name === "string" && SHELL_NAME_PATTERN.test(shell.name);
}
