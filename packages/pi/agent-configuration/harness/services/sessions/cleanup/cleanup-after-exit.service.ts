import type { HerdrCommand } from "../../../types/sessions/herdr/herdr-command.interface.ts";
import { processStartIdentity } from "../registry/process-start-identity.service.ts";
import { closeAfterExit } from "./close-after-exit.service.ts";
import { isSessionCleanupTarget } from "./is-session-cleanup-target.service.ts";
import { sleep } from "./sleep.service.ts";

export async function cleanupAfterExit(
  sessionRow: unknown,
  command: HerdrCommand,
  identity: (pid: number) => Promise<string> = processStartIdentity,
  wait: (milliseconds: number) => Promise<void> = sleep,
): Promise<boolean> {
  if (!isSessionCleanupTarget(sessionRow)) return false;
  return closeAfterExit(
    {
      pid: sessionRow.pid,
      processStart: sessionRow.processStart,
      pane: sessionRow.pane,
      tab: sessionRow.tab,
      workspace: sessionRow.workspace,
      shell: { required: false },
    },
    command,
    identity,
    wait,
  );
}
