import { PROCESS_EXIT_POLL_ATTEMPTS, WORKER_POLL_INTERVAL_MS } from "../../../constants/sessions/cleanup.constant.ts";
import type { PaneCloseTarget } from "../../../types/sessions/cleanup/pane-close-target.interface.ts";
import { hasErrorCode } from "../registry/has-error-code.service.ts";

type ProcessOutcome = "running" | "exited" | "untrusted";

export async function waitForProcessExit(
  target: PaneCloseTarget,
  identity: (pid: number) => Promise<string>,
  wait: (milliseconds: number) => Promise<void>,
): Promise<boolean> {
  for (let attempt = 0; attempt < PROCESS_EXIT_POLL_ATTEMPTS; attempt++) {
    const outcome = await readProcessOutcome(target, identity);
    if (outcome !== "running") return outcome === "exited";
    await wait(WORKER_POLL_INTERVAL_MS);
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
    return hasErrorCode(error, "ENOENT") || hasErrorCode(error, "ESRCH") ? "exited" : "untrusted";
  }
}
