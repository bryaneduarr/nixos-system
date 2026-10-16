import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import type { CleanupCancellation } from "../../../types/sessions/cleanup-cancellation.interface.ts";
import type { CleanupWorkerPayload } from "../../../types/sessions/cleanup-worker-payload.interface.ts";
import { socketEnvironment } from "../herdr/socket-environment.service.ts";

export async function launchCleanupWorker(payload: CleanupWorkerPayload): Promise<CleanupCancellation> {
  const worker = fileURLToPath(new URL("./run-cleanup-worker.service.ts", import.meta.url));
  const child = spawn(process.execPath, [worker, JSON.stringify(payload)], {
    detached: true,
    stdio: "ignore",
    env: socketEnvironment(payload.socket),
  });
  await new Promise<void>((resolve, reject) => {
    child.once("spawn", resolve);
    child.once("error", reject);
  });
  child.unref();
  return () => {
    child.kill();
  };
}
