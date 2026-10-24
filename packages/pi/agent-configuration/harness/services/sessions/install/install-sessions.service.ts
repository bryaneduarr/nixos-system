import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { installExitCommand } from "../../../commands/exit/exit.command.ts";
import { installNewSessionCommand } from "../../../commands/new-session/new-session.command.ts";
import { installSessionsCommand } from "../../../commands/sessions/sessions.command.ts";
import type { SessionDependencies } from "../../../types/sessions/install/session-dependencies.interface.ts";
import { installExitEvents } from "../events/install-exit-events.service.ts";
import { installSessionActivityEvents } from "../events/install-session-activity-events.service.ts";
import { installSessionCompactionEvents } from "../events/install-session-compaction-events.service.ts";
import { installSessionLifecycleEvents } from "../events/install-session-lifecycle-events.service.ts";
import { createSessionMonitorState } from "../monitor/lifecycle/create-session-monitor-state.service.ts";
import { createProjectSession } from "../monitor/switch/create-project-session.service.ts";
import { showSessionMenu } from "../monitor/switch/show-session-menu.service.ts";
import { createDefaultSessionDependencies } from "./create-default-session-dependencies.service.ts";

export function installSessions(
  pi: ExtensionAPI,
  dependencies: SessionDependencies = createDefaultSessionDependencies(),
): void {
  installExitEvents(pi);
  installExitCommand(pi, dependencies.exit);
  const state = createSessionMonitorState();
  installSessionLifecycleEvents(pi, state, dependencies);
  installSessionActivityEvents(pi, state);
  installSessionCompactionEvents(pi, state);
  installSessionsCommand(pi, (ctx) => showSessionMenu(state, ctx, dependencies));
  installNewSessionCommand(pi, (ctx) => createProjectSession(state, ctx, dependencies));
}
