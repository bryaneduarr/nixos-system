import type { HerdrCommand } from "../../../types/sessions/herdr/herdr-command.interface.ts";
import { processStartIdentity } from "../registry/process-start-identity.service.ts";
import { closeAfterExit } from "./close-after-exit.service.ts";
import { isExplicitExitTarget } from "./is-explicit-exit-target.service.ts";
import { sleep } from "./sleep.service.ts";

export async function explicitExitAfterExit(
  row: unknown,
  command: HerdrCommand,
  identity: (pid: number) => Promise<string> = processStartIdentity,
  wait: (milliseconds: number) => Promise<void> = sleep,
): Promise<boolean> {
  if (!isExplicitExitTarget(row)) return false;
  return closeAfterExit(
    {
      pid: row.pid,
      processStart: row.processStart,
      pane: row.pane,
      tab: row.tab,
      workspace: row.workspace,
      shell: { required: true, pid: row.shellPid, start: row.shellStart },
    },
    command,
    identity,
    wait,
  );
}
