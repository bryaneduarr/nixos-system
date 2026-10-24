import { NON_EMPTY_TEXT_PATTERN } from "../../../../constants/sessions/cleanup/cleanup-target.constant.ts";
import { EXPLICIT_EXIT_MODE } from "../../../../constants/sessions/exit/exit.constant.ts";
import {
  PANE_ID_PATTERN,
  TAB_ID_PATTERN,
  WORKSPACE_ID_PATTERN,
} from "../../../../constants/sessions/herdr/herdr.constant.ts";
import { ABSOLUTE_PATH_PATTERN } from "../../../../constants/sessions/registry/registry.constant.ts";
import type { ExitTarget } from "../../../../types/sessions/exit/exit-target.interface.ts";
import { isObjectRecord } from "../../herdr/response/is-object-record.service.ts";
import { isPositiveSafeInteger } from "./is-positive-safe-integer.service.ts";
import { isTextMatching } from "./is-text-matching.service.ts";

export function isExplicitExitTarget(candidate: unknown): candidate is ExitTarget {
  if (!isObjectRecord(candidate)) return false;
  const isExplicitMode = candidate.mode === EXPLICIT_EXIT_MODE;
  const hasProcessStart = isTextMatching(candidate.processStart, NON_EMPTY_TEXT_PATTERN);
  const hasShellStart = isTextMatching(candidate.shellStart, NON_EMPTY_TEXT_PATTERN);
  const hasProcessId = isPositiveSafeInteger(candidate.pid);
  const hasShellProcessId = isPositiveSafeInteger(candidate.shellPid);
  const isShellOtherThanProcess = candidate.shellPid !== candidate.pid;
  const hasSocket = isTextMatching(candidate.socket, ABSOLUTE_PATH_PATTERN);
  const hasWorkspace = isTextMatching(candidate.workspace, WORKSPACE_ID_PATTERN);
  const hasPaneInWorkspace =
    hasWorkspace &&
    isTextMatching(candidate.pane, PANE_ID_PATTERN) &&
    candidate.pane.startsWith(`${candidate.workspace}:`);
  const hasTabInWorkspace =
    hasWorkspace &&
    isTextMatching(candidate.tab, TAB_ID_PATTERN) &&
    candidate.tab.startsWith(`${candidate.workspace}:`);
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
