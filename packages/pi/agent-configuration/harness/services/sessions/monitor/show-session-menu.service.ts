import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SessionMonitorState } from "../../../types/sessions/monitor/session-monitor-state.interface.ts";
import type { SessionDependencies } from "../../../types/sessions/session-dependencies.interface.ts";
import { switchSession } from "./switch-session.service.ts";

export function showSessionMenu(
  state: SessionMonitorState,
  ctx: ExtensionContext,
  dependencies: SessionDependencies,
): Promise<void> {
  return switchSession(state, ctx, dependencies, async (session) => {
    const selection = await dependencies.selectSession(ctx, session.registry);
    if (selection === "cancel") return false;
    if (selection === "new") {
      const project = await dependencies.selectProject(ctx, session.registry);
      if (!project.selected) return false;
      await session.herdr.create(project.path, session.pane);
      return true;
    }
    await session.herdr.focus(selection);
    return selection.identity !== session.identity && selection.pane !== session.pane.pane;
  });
}
