import {
  PROCESS_EXIT_POLL_ATTEMPTS,
  WORKER_POLL_INTERVAL_MS,
} from "../../../../constants/sessions/cleanup/cleanup-timing.constant.ts";
import {
  MISSING_FILE_CODE,
  NO_SUCH_PROCESS_CODE,
} from "../../../../constants/sessions/registry/registry-files.constant.ts";
import type { PaneCloseDependencies } from "../../../../types/sessions/cleanup/pane/pane-close-dependencies.interface.ts";
import type { PaneCloseTarget } from "../../../../types/sessions/cleanup/pane/pane-close-target.interface.ts";
import { hasErrorCode } from "../../errors/has-error-code.service.ts";

type ProcessOutcome = "running" | "exited" | "untrusted";

export async function waitForProcessExit(
  target: PaneCloseTarget,
  dependencies: PaneCloseDependencies,
): Promise<boolean> {
  for (let attempt = 0; attempt < PROCESS_EXIT_POLL_ATTEMPTS; attempt++) {
    const outcome = await readProcessOutcome(target, dependencies.identity);
    if (outcome !== "running") return outcome === "exited";
    await dependencies.wait(WORKER_POLL_INTERVAL_MS);
  }
  return false;
}

async function readProcessOutcome(
  target: PaneCloseTarget,
  identity: (pid: number) => Promise<string>,
): Promise<ProcessOutcome> {
  try {
    return (await identity(target.pid)) === target.processStart ? "running" : "untrusted";
  } catch (error) {
    return hasErrorCode(error, MISSING_FILE_CODE) || hasErrorCode(error, NO_SUCH_PROCESS_CODE) ? "exited" : "untrusted";
  }
}
