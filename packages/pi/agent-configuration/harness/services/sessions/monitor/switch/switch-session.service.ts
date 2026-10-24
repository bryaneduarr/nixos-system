import { PI_INTERACTIVE_MODE } from "../../../../constants/sessions/install/environment.constant.ts";
import type { ReplacedSessionCleanup } from "../../../../types/sessions/monitor/replaced-session-cleanup.interface.ts";
import type { SessionSwitch } from "../../../../types/sessions/monitor/session-switch.interface.ts";
import { canCleanup } from "../../cleanup/after-exit/can-cleanup.service.ts";
import { publishSessionMonitor } from "../publish/publish-session-monitor.service.ts";

export async function switchSession(sessionSwitch: SessionSwitch): Promise<void> {
  const { state, ctx, dependencies, select } = sessionSwitch;
  if (state.open) return;
  if (ctx.mode !== PI_INTERACTIVE_MODE || state.session.state === "absent") {
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
      await scheduleReplacedSessionCleanup({ state, ctx, dependencies, session });
    }
  } catch (error) {
    ctx.ui.notify(`Session operation failed: ${String(error)}`, "error");
  } finally {
    state.open = false;
  }
}

async function scheduleReplacedSessionCleanup(replaced: ReplacedSessionCleanup): Promise<void> {
  const { state, ctx, dependencies, session } = replaced;
  if (session.latest.state === "absent" || state.historyEver) return;
  const latest = session.latest.value;
  const cleanupCheck = { row: latest, ctx, compacting: state.compacting, userBash: state.userBash };
  if (!canCleanup(cleanupCheck)) return;
  const cancel = await dependencies.scheduleCleanup({ ...latest, cleanupSafe: true }, session.socket);
  if (!state.historyEver && canCleanup(cleanupCheck)) ctx.shutdown();
  else cancel();
}
