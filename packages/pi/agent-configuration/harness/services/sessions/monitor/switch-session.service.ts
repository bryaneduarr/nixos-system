import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { MonitoredSession } from "../../../types/sessions/monitor/monitored-session.interface.ts";
import type { SessionMonitorState } from "../../../types/sessions/monitor/session-monitor-state.interface.ts";
import type { SessionDependencies } from "../../../types/sessions/session-dependencies.interface.ts";
import { canCleanup } from "../cleanup/can-cleanup.service.ts";
import { publishSessionMonitor } from "./publish-session-monitor.service.ts";

export async function switchSession(
  state: SessionMonitorState,
  ctx: ExtensionContext,
  dependencies: SessionDependencies,
  select: (session: MonitoredSession) => Promise<boolean>,
): Promise<void> {
  if (state.open) return;
  if (ctx.mode !== "tui" || state.session.state === "absent") {
    ctx.ui.notify("Sessions require an interactive Pi session inside Herdr", "warning");
    return;
  }
  const session = state.session.value;
  state.open = true;
  try {
    session.context = ctx;
    await publishSessionMonitor(state);
    if (await select(session)) {
      await publishSessionMonitor(state);
      await scheduleReplacedSessionCleanup(state, ctx, dependencies, session);
    }
  } catch (error) {
    ctx.ui.notify(`Session operation failed: ${String(error)}`, "error");
  } finally {
    state.open = false;
  }
}

async function scheduleReplacedSessionCleanup(
  state: SessionMonitorState,
  ctx: ExtensionContext,
  dependencies: SessionDependencies,
  session: MonitoredSession,
): Promise<void> {
  if (session.latest.state === "absent" || state.historyEver) return;
  const latest = session.latest.value;
  if (!canCleanup(latest, ctx, state.compacting, state.userBash)) return;
  const cancel = await dependencies.scheduleCleanup({ ...latest, cleanupSafe: true }, session.socket);
  if (!state.historyEver && canCleanup(latest, ctx, state.compacting, state.userBash)) ctx.shutdown();
  else cancel();
}
