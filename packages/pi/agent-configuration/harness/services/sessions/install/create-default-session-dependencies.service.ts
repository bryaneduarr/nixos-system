import { defaultExitDependencies } from "../../../commands/exit/exit.command.ts";
import type { SessionDependencies } from "../../../types/sessions/session-dependencies.interface.ts";
import { scheduleCleanup } from "../cleanup/schedule-cleanup.service.ts";
import { createHerdrSessions } from "../herdr/create-herdr-sessions.service.ts";
import { scopedHerdr } from "../herdr/scoped-herdr.service.ts";

export function createDefaultSessionDependencies(): SessionDependencies {
  return {
    herdr: (registry, socket) => createHerdrSessions(registry, scopedHerdr(socket)),
    selectSession: async (ctx, registry) =>
      (await import("../menu/select-session.service.ts")).selectSession(ctx, registry),
    selectProject: async (ctx, registry) =>
      (await import("../menu/select-project.service.ts")).selectProject(ctx, registry),
    scheduleCleanup,
    exit: defaultExitDependencies,
  };
}
