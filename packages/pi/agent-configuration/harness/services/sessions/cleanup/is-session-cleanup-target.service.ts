import { NON_EMPTY_TEXT_PATTERN } from "../../../constants/sessions/cleanup-payload.constant.ts";
import { PANE_ID_PATTERN, TAB_ID_PATTERN } from "../../../constants/sessions/herdr.constant.ts";
import { ABSOLUTE_PATH_PATTERN } from "../../../constants/sessions/registry.constant.ts";
import type { SessionCleanupTarget } from "../../../types/sessions/cleanup/session-cleanup-target.interface.ts";
import { isObjectRecord } from "../herdr/is-object-record.service.ts";
import { isPositiveSafeInteger } from "./is-positive-safe-integer.service.ts";
import { isTextMatching } from "./is-text-matching.service.ts";

export function isSessionCleanupTarget(value: unknown): value is SessionCleanupTarget {
  if (!isObjectRecord(value)) return false;
  const isOwnedSession = value.owned === true;
  const hasNoHistory = value.historyEver === false;
  const isCleanupSafe = value.cleanupSafe === true;
  const hasProcessStart = isTextMatching(value.processStart, NON_EMPTY_TEXT_PATTERN);
  const hasProcessId = isPositiveSafeInteger(value.pid);
  const hasSocket = isTextMatching(value.socket, ABSOLUTE_PATH_PATTERN);
  const hasPane = isTextMatching(value.pane, PANE_ID_PATTERN);
  const hasTab = isTextMatching(value.tab, TAB_ID_PATTERN);
  const hasWorkspace = typeof value.workspace === "string";
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
