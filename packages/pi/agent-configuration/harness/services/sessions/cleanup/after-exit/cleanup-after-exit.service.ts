import type { PaneCloseDependencies } from "../../../../types/sessions/cleanup/pane/pane-close-dependencies.interface.ts";
import { closeAfterExit } from "../pane/close-after-exit.service.ts";
import { isSessionCleanupTarget } from "../target/is-session-cleanup-target.service.ts";

export async function cleanupAfterExit(sessionRow: unknown, dependencies: PaneCloseDependencies): Promise<boolean> {
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
    dependencies,
  );
}
