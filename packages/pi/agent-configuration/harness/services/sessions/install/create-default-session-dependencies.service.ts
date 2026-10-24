import { defaultExitDependencies } from "../../../commands/exit/exit.command.ts";
import type { SessionDependencies } from "../../../types/sessions/install/session-dependencies.interface.ts";
import { scheduleCleanup } from "../cleanup/worker/schedule-cleanup.service.ts";
import { scopedHerdr } from "../herdr/command/scoped-herdr.service.ts";
import { createHerdrSessions } from "../herdr/create-herdr-sessions.service.ts";

export function createDefaultSessionDependencies(): SessionDependencies {
  return {
    herdr: (registry, socket) => createHerdrSessions(registry, scopedHerdr(socket)),
    selectSession: async (ctx, registry) =>
      (await import("../menu/session/select-session.service.ts")).selectSession(ctx, registry),
    selectProject: async (ctx, registry) =>
      (await import("../menu/project/select-project.service.ts")).selectProject(ctx, registry),
    scheduleCleanup,
    exit: defaultExitDependencies,
  };
}
