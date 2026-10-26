import {
  PANE_CLOSE_POLL_ATTEMPTS,
  WORKER_POLL_INTERVAL_MS,
} from "../../../../constants/sessions/cleanup/cleanup-timing.constant.ts";
import { HERDR_PANE_CLOSE } from "../../../../constants/sessions/herdr/herdr-command.constant.ts";
import type { PaneCloseDependencies } from "../../../../types/sessions/cleanup/pane/pane-close-dependencies.interface.ts";
import type { PaneCloseTarget } from "../../../../types/sessions/cleanup/pane/pane-close-target.interface.ts";
import { dedicatedShell } from "./dedicated-shell.service.ts";
import { inspectPane } from "./inspect-pane.service.ts";

export async function closeDedicatedPane(
  target: PaneCloseTarget,
  dependencies: PaneCloseDependencies,
): Promise<boolean> {
  for (let attempt = 0; attempt < PANE_CLOSE_POLL_ATTEMPTS; attempt++) {
    if (dedicatedShell(target, await inspectPane(target, dependencies.command))) {
      return confirmAndClose(target, dependencies);
    }
    await dependencies.wait(WORKER_POLL_INTERVAL_MS);
  }
  return false;
}

async function confirmAndClose(target: PaneCloseTarget, dependencies: PaneCloseDependencies): Promise<boolean> {
  if (!dedicatedShell(target, await inspectPane(target, dependencies.command))) return false;
  const isShellOwnerVerified =
    !target.shell.required || (await isShellStillOwner(target.shell.pid, target.shell.start, dependencies));
  if (!isShellOwnerVerified) return false;
  await dependencies.command([...HERDR_PANE_CLOSE, target.pane]);
  return true;
}

async function isShellStillOwner(
  shellPid: number,
  shellStart: string,
  dependencies: PaneCloseDependencies,
): Promise<boolean> {
  try {
    return (await dependencies.identity(shellPid)) === shellStart;
  } catch {
    return false;
  }
}
