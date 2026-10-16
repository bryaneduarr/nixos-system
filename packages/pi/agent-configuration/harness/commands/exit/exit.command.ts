import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { launchCleanupWorker } from "../../services/sessions/cleanup/launch-cleanup-worker.service.ts";
import { runExplicitExit } from "../../services/sessions/exit/run-explicit-exit.service.ts";
import { scopedHerdr } from "../../services/sessions/herdr/scoped-herdr.service.ts";
import type { ExitDependencies } from "../../types/sessions/exit/exit-dependencies.interface.ts";

export const defaultExitDependencies: ExitDependencies = {
  command: scopedHerdr,
  schedule: launchCleanupWorker,
};

export function installExitCommand(pi: ExtensionAPI, dependencies: ExitDependencies): void {
  const exit = (ctx: ExtensionContext): Promise<void> => runExplicitExit(ctx, dependencies);
  pi.registerCommand("exit", {
    description: "Exit Pi and safely close its Herdr pane",
    handler: async (_args, ctx) => exit(ctx),
  });
  pi.registerShortcut("ctrl+alt+q", { description: "Exit Pi and safely close its Herdr pane", handler: exit });
}
