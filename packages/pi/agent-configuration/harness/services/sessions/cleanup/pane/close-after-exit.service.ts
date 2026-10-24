import type { PaneCloseDependencies } from "../../../../types/sessions/cleanup/pane/pane-close-dependencies.interface.ts";
import type { PaneCloseTarget } from "../../../../types/sessions/cleanup/pane/pane-close-target.interface.ts";
import { closeDedicatedPane } from "./close-dedicated-pane.service.ts";
import { waitForProcessExit } from "./wait-for-process-exit.service.ts";

export async function closeAfterExit(target: PaneCloseTarget, dependencies: PaneCloseDependencies): Promise<boolean> {
  const hasExited = await waitForProcessExit(target, dependencies);
  if (!hasExited) return false;
  return closeDedicatedPane(target, dependencies);
}
