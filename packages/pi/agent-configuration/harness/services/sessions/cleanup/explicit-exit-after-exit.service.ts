import type { HerdrCommand } from "../../../types/sessions/herdr/herdr-command.interface.ts";
import { processStartIdentity } from "../registry/process-start-identity.service.ts";
import { closeAfterExit } from "./close-after-exit.service.ts";
import { isExplicitExitTarget } from "./is-explicit-exit-target.service.ts";
import { sleep } from "./sleep.service.ts";

export async function explicitExitAfterExit(
  explicitExitRow: unknown,
  command: HerdrCommand,
  identity: (pid: number) => Promise<string> = processStartIdentity,
  wait: (milliseconds: number) => Promise<void> = sleep,
): Promise<boolean> {
  if (!isExplicitExitTarget(explicitExitRow)) return false;
  return closeAfterExit(
    {
      pid: explicitExitRow.pid,
      processStart: explicitExitRow.processStart,
      pane: explicitExitRow.pane,
      tab: explicitExitRow.tab,
      workspace: explicitExitRow.workspace,
      shell: { required: true, pid: explicitExitRow.shellPid, start: explicitExitRow.shellStart },
    },
    command,
    identity,
    wait,
  );
}
