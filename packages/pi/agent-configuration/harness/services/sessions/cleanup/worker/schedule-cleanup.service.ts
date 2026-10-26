import { PI_MANAGED_SESSION_VARIABLE } from "../../../../constants/sessions/install/environment.constant.ts";
import type { CleanupCancellation } from "../../../../types/sessions/cleanup/worker/cleanup-cancellation.interface.ts";
import type { LiveSession } from "../../../../types/sessions/registry/row/live-session.interface.ts";
import { processStartIdentity } from "../../registry/identity/process-start-identity.service.ts";
import { launchCleanupWorker } from "./launch-cleanup-worker.service.ts";

export async function scheduleCleanup(row: LiveSession, socket: string): Promise<CleanupCancellation> {
  const isOwnedByThisProcess =
    row.owned && row.identity === process.env[PI_MANAGED_SESSION_VARIABLE] && row.pid === process.pid;
  const isUntouched = !row.historyEver && row.cleanupSafe;
  const hasProcessStart = row.processStart !== "";
  const isSameProcess = hasProcessStart && row.processStart === (await processStartIdentity(row.pid));
  if (!isOwnedByThisProcess || !isUntouched || !isSameProcess) throw new Error("Cleanup ownership changed");
  return launchCleanupWorker({ ...row, socket });
}
