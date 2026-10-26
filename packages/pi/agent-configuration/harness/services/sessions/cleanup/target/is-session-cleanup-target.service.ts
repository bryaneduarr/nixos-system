import { NON_EMPTY_TEXT_PATTERN } from "../../../../constants/sessions/cleanup/cleanup-target.constant.ts";
import { PANE_ID_PATTERN, TAB_ID_PATTERN } from "../../../../constants/sessions/herdr/herdr.constant.ts";
import { ABSOLUTE_PATH_PATTERN } from "../../../../constants/sessions/registry/registry.constant.ts";
import type { SessionCleanupTarget } from "../../../../types/sessions/cleanup/target/session-cleanup-target.interface.ts";
import { isObjectRecord } from "../../herdr/response/is-object-record.service.ts";
import { isPositiveSafeInteger } from "./is-positive-safe-integer.service.ts";
import { isTextMatching } from "./is-text-matching.service.ts";

export function isSessionCleanupTarget(candidate: unknown): candidate is SessionCleanupTarget {
  if (!isObjectRecord(candidate)) return false;
  const isOwnedSession = candidate.owned === true;
  const hasNoHistory = candidate.historyEver === false;
  const isCleanupSafe = candidate.cleanupSafe === true;
  const hasProcessStart = isTextMatching(candidate.processStart, NON_EMPTY_TEXT_PATTERN);
  const hasProcessId = isPositiveSafeInteger(candidate.pid);
  const hasSocket = isTextMatching(candidate.socket, ABSOLUTE_PATH_PATTERN);
  const hasPane = isTextMatching(candidate.pane, PANE_ID_PATTERN);
  const hasTab = isTextMatching(candidate.tab, TAB_ID_PATTERN);
  const hasWorkspace = typeof candidate.workspace === "string";
  return (
    isOwnedSession &&
    hasNoHistory &&
    isCleanupSafe &&
    hasProcessStart &&
    hasProcessId &&
    hasSocket &&
    hasPane &&
    hasTab &&
    hasWorkspace
  );
}
