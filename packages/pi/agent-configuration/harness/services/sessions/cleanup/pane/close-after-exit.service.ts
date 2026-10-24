import type { PaneCloseTarget } from "../../../../types/sessions/cleanup/pane/pane-close-target.interface.ts";
import type { HerdrCommand } from "../../../../types/sessions/herdr/command/herdr-command.interface.ts";
import { closeDedicatedPane } from "./close-dedicated-pane.service.ts";
import { waitForProcessExit } from "./wait-for-process-exit.service.ts";

export async function closeAfterExit(
  target: PaneCloseTarget,
  command: HerdrCommand,
  identity: (pid: number) => Promise<string>,
  wait: (milliseconds: number) => Promise<void>,
): Promise<boolean> {
  const hasExited = await waitForProcessExit(target, identity, wait);
  if (!hasExited) return false;
  return closeDedicatedPane(target, command, identity, wait);
}
