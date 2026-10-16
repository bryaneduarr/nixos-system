import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { HerdrSessions } from "../../sessions/herdr.ts";
import type { SessionRegistry } from "../../sessions/registry.ts";
import type { CleanupCancellation } from "./cleanup-cancellation.interface.ts";
import type { ExitDependencies } from "./exit/exit-dependencies.interface.ts";
import type { MenuSelection } from "./menu/menu-selection.interface.ts";
import type { ProjectSelection } from "./menu/project-selection.interface.ts";
import type { LiveSession } from "./registry/live-session.interface.ts";

/* External effects of the session commands, replaceable in tests. */
export interface SessionDependencies {
  /* Creates the Herdr session service for a registry and socket. */
  readonly herdr: (registry: SessionRegistry, socket: string) => HerdrSessions;
  /* Shows the live session menu and returns the choice. */
  readonly selectSession: (ctx: ExtensionContext, registry: SessionRegistry) => Promise<MenuSelection>;
  /* Asks for a project directory for a new session. */
  readonly selectProject: (ctx: ExtensionContext, registry: SessionRegistry) => Promise<ProjectSelection>;
  /* Schedules the cleanup worker that closes a pane after a session is replaced. */
  readonly scheduleCleanup: (row: LiveSession, socket: string) => Promise<CleanupCancellation>;
  /* Effects of the explicit exit command. */
  readonly exit: ExitDependencies;
}
