import type { HerdrCommand } from "../../../../types/sessions/herdr/command/herdr-command.interface.ts";
import { processStartIdentity } from "../../registry/identity/process-start-identity.service.ts";
import { closeAfterExit } from "../pane/close-after-exit.service.ts";
import { sleep } from "../pane/sleep.service.ts";
import { isExplicitExitTarget } from "../target/is-explicit-exit-target.service.ts";

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
