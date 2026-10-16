import { NON_EMPTY_TEXT_PATTERN } from "../../../constants/sessions/cleanup-payload.constant.ts";
import { EXPLICIT_EXIT_MODE } from "../../../constants/sessions/exit.constant.ts";
import { PANE_ID_PATTERN, TAB_ID_PATTERN, WORKSPACE_ID_PATTERN } from "../../../constants/sessions/herdr.constant.ts";
import { ABSOLUTE_PATH_PATTERN } from "../../../constants/sessions/registry.constant.ts";
import type { ExitTarget } from "../../../types/sessions/exit/exit-target.interface.ts";
import { isObjectRecord } from "../herdr/is-object-record.service.ts";
import { isPositiveSafeInteger } from "./is-positive-safe-integer.service.ts";
import { isTextMatching } from "./is-text-matching.service.ts";

export function isExplicitExitTarget(value: unknown): value is ExitTarget {
  if (!isObjectRecord(value)) return false;
  const isExplicitMode = value.mode === EXPLICIT_EXIT_MODE;
  const hasProcessStart = isTextMatching(value.processStart, NON_EMPTY_TEXT_PATTERN);
  const hasShellStart = isTextMatching(value.shellStart, NON_EMPTY_TEXT_PATTERN);
  const hasProcessId = isPositiveSafeInteger(value.pid);
  const hasShellProcessId = isPositiveSafeInteger(value.shellPid);
  const isShellOtherThanProcess = value.shellPid !== value.pid;
  const hasSocket = isTextMatching(value.socket, ABSOLUTE_PATH_PATTERN);
  const hasWorkspace = isTextMatching(value.workspace, WORKSPACE_ID_PATTERN);
  const hasPaneInWorkspace =
    isTextMatching(value.pane, PANE_ID_PATTERN) && hasWorkspace && value.pane.startsWith(`${value.workspace}:`);
  const hasTabInWorkspace =
    isTextMatching(value.tab, TAB_ID_PATTERN) && hasWorkspace && value.tab.startsWith(`${value.workspace}:`);
  return (
    isExplicitMode &&
    hasProcessStart &&
    hasShellStart &&
    hasProcessId &&
    hasShellProcessId &&
    isShellOtherThanProcess &&
    hasSocket &&
    hasPaneInWorkspace &&
    hasTabInWorkspace
  );
}
