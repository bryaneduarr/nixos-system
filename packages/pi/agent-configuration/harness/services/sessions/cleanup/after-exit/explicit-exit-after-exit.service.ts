import type { PaneCloseDependencies } from "../../../../types/sessions/cleanup/pane/pane-close-dependencies.interface.ts";
import { closeAfterExit } from "../pane/close-after-exit.service.ts";
import { isExplicitExitTarget } from "../target/is-explicit-exit-target.service.ts";

export async function explicitExitAfterExit(
  explicitExitRow: unknown,
  dependencies: PaneCloseDependencies,
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
    dependencies,
  );
}
