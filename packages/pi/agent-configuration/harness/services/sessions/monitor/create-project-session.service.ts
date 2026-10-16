import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SessionMonitorState } from "../../../types/sessions/monitor/session-monitor-state.interface.ts";
import type { SessionDependencies } from "../../../types/sessions/session-dependencies.interface.ts";
import { canonicalDirectory } from "../registry/canonical-directory.service.ts";
import { switchSession } from "./switch-session.service.ts";

export function createProjectSession(
  state: SessionMonitorState,
  ctx: ExtensionContext,
  dependencies: SessionDependencies,
): Promise<void> {
  return switchSession(state, ctx, dependencies, async (session) => {
    const project = await canonicalDirectory(ctx.cwd, ctx.cwd);
    await session.herdr.create(project, session.pane);
    return true;
  });
}
