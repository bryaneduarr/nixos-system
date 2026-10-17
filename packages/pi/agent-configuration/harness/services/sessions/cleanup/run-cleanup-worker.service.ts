import { fileURLToPath } from "node:url";
import { cleanupAfterExit } from "./cleanup-after-exit.service.ts";
import { explicitExitAfterExit } from "./explicit-exit-after-exit.service.ts";
import { isExplicitExitTarget } from "./is-explicit-exit-target.service.ts";
import { isSessionCleanupTarget } from "./is-session-cleanup-target.service.ts";
import { createWorkerHerdrCommand } from "./worker-herdr-command.service.ts";

export async function runCleanupWorker(payloadText: string): Promise<void> {
  const payload: unknown = JSON.parse(payloadText);
  if (isExplicitExitTarget(payload)) {
    await explicitExitAfterExit(payload, createWorkerHerdrCommand(payload.socket));
    return;
  }
  if (isSessionCleanupTarget(payload)) await cleanupAfterExit(payload, createWorkerHerdrCommand(payload.socket));
}

if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv[2]) {
  runCleanupWorker(process.argv[2]).catch(() => {});
}
