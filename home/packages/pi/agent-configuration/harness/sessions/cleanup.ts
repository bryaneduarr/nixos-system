import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { processStartIdentity, type LiveSession } from "./registry.ts";

export function canCleanup(row: LiveSession, ctx: ExtensionContext, compacting: boolean, userBash: boolean): boolean {
  if (!row.owned || row.historyEver || compacting || userBash || ctx.signal) return false;
  return ctx.isIdle() && !ctx.hasPendingMessages() && ctx.ui.getEditorText() === "";
}

export async function scheduleCleanup(row: LiveSession, socket: string): Promise<() => void> {
  const owned = row.owned && row.identity === process.env.PI_MANAGED_SESSION && row.pid === process.pid;
  const untouched = !row.historyEver && row.cleanupSafe;
  const sameProcess = row.processStart && row.processStart === await processStartIdentity(row.pid);
  if (!owned || !untouched || !sameProcess) throw new Error("Cleanup ownership changed");

  return launchCleanupWorker({ ...row, socket });
}

export async function launchCleanupWorker(row: object & { socket: string }): Promise<() => void> {
  const socket = row.socket;
  const worker = fileURLToPath(new URL("./cleanup-worker.mjs", import.meta.url));
  const payload = JSON.stringify(row);
  const child = spawn(process.execPath, [worker, payload], {
    detached: true,
    stdio: "ignore",
    env: { ...process.env, HERDR_SOCKET_PATH: socket, HERDR_API_SOCKET: socket },
  });
  await new Promise<void>((resolve, reject) => {
    child.once("spawn", resolve);
    child.once("error", reject);
  });
  child.unref();
  return () => { child.kill(); };
}
