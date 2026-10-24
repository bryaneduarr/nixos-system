import { fileURLToPath } from "node:url";
import type { PaneCloseDependencies } from "../../../../types/sessions/cleanup/pane/pane-close-dependencies.interface.ts";
import { createWorkerHerdrCommand } from "../../herdr/command/create-worker-herdr-command.service.ts";
import { processStartIdentity } from "../../registry/identity/process-start-identity.service.ts";
import { cleanupAfterExit } from "../after-exit/cleanup-after-exit.service.ts";
import { explicitExitAfterExit } from "../after-exit/explicit-exit-after-exit.service.ts";
import { sleep } from "../pane/sleep.service.ts";
import { isExplicitExitTarget } from "../target/is-explicit-exit-target.service.ts";
import { isSessionCleanupTarget } from "../target/is-session-cleanup-target.service.ts";

function workerDependencies(socket: string): PaneCloseDependencies {
  return { command: createWorkerHerdrCommand(socket), identity: processStartIdentity, wait: sleep };
}

export async function runCleanupWorker(payloadText: string): Promise<void> {
  const payload: unknown = JSON.parse(payloadText);
  if (isExplicitExitTarget(payload)) {
    await explicitExitAfterExit(payload, workerDependencies(payload.socket));
    return;
  }
  if (isSessionCleanupTarget(payload)) await cleanupAfterExit(payload, workerDependencies(payload.socket));
}

if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv[2]) {
  runCleanupWorker(process.argv[2]).catch(() => {});
}
