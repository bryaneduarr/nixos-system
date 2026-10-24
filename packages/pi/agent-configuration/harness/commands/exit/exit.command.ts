import {
  EXIT_COMMAND_DESCRIPTION,
  EXIT_COMMAND_NAME,
  EXIT_SHORTCUT,
} from "../../constants/sessions/exit/exit.constant.ts";
import { launchCleanupWorker } from "../../services/sessions/cleanup/worker/launch-cleanup-worker.service.ts";
import { runExplicitExit } from "../../services/sessions/exit/run-explicit-exit.service.ts";
import { scopedHerdr } from "../../services/sessions/herdr/command/scoped-herdr.service.ts";
import type { ExitCommandApi } from "../../types/sessions/exit/exit-command-api.interface.ts";
import type { ExitContext } from "../../types/sessions/exit/exit-context.interface.ts";
import type { ExitDependencies } from "../../types/sessions/exit/exit-dependencies.interface.ts";

export const defaultExitDependencies: ExitDependencies = {
  command: scopedHerdr,
  schedule: launchCleanupWorker,
};

export function installExitCommand(pi: ExitCommandApi, dependencies: ExitDependencies): void {
  const exit = (ctx: ExitContext): Promise<void> => runExplicitExit(ctx, dependencies);
  pi.registerCommand(EXIT_COMMAND_NAME, {
    description: EXIT_COMMAND_DESCRIPTION,
    handler: async (_args, ctx) => exit(ctx),
  });
  pi.registerShortcut(EXIT_SHORTCUT, { description: EXIT_COMMAND_DESCRIPTION, handler: exit });
}
