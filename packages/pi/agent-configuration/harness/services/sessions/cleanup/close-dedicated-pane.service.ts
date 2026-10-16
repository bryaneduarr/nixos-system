import { PANE_CLOSE_POLL_ATTEMPTS, WORKER_POLL_INTERVAL_MS } from "../../../constants/sessions/cleanup.constant.ts";
import type { PaneCloseTarget } from "../../../types/sessions/cleanup/pane-close-target.interface.ts";
import type { HerdrCommand } from "../../../types/sessions/herdr/herdr-command.interface.ts";
import { dedicatedShell } from "./dedicated-shell.service.ts";

export async function closeDedicatedPane(
  target: PaneCloseTarget,
  command: HerdrCommand,
  identity: (pid: number) => Promise<string>,
  wait: (milliseconds: number) => Promise<void>,
): Promise<boolean> {
  for (let attempt = 0; attempt < PANE_CLOSE_POLL_ATTEMPTS; attempt++) {
    const tab = (await command(["tab", "get", target.tab])).tab;
    const pane = (await command(["pane", "get", target.pane])).pane;
    const processInfo = (await command(["pane", "process-info", "--pane", target.pane])).process_info;
    if (dedicatedShell(target, tab, pane, processInfo)) {
      return confirmAndClose(target, command, identity);
    }
    await wait(WORKER_POLL_INTERVAL_MS);
  }
  return false;
}

async function confirmAndClose(
  target: PaneCloseTarget,
  command: HerdrCommand,
  identity: (pid: number) => Promise<string>,
): Promise<boolean> {
  const tab = (await command(["tab", "get", target.tab])).tab;
  const pane = (await command(["pane", "get", target.pane])).pane;
  const processInfo = (await command(["pane", "process-info", "--pane", target.pane])).process_info;
  if (!dedicatedShell(target, tab, pane, processInfo)) return false;
  if (target.shell.required && !(await isShellStillOwner(target.shell.pid, target.shell.start, identity))) return false;
  await command(["pane", "close", target.pane]);
  return true;
}

async function isShellStillOwner(
  shellPid: number,
  shellStart: string,
  identity: (pid: number) => Promise<string>,
): Promise<boolean> {
  try {
    return (await identity(shellPid)) === shellStart;
  } catch {
    return false;
  }
}
