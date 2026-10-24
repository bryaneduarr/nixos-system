import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { PI_INTERACTIVE_MODE } from "../../../constants/sessions/install/environment.constant.ts";
import type { MonitoredSession } from "../../../types/sessions/monitor/monitored-session.interface.ts";
import type { SessionMonitorState } from "../../../types/sessions/monitor/session-monitor-state.interface.ts";
import { latchSessionHistory } from "../monitor/publish/latch-session-history.service.ts";
import { publishSessionMonitor } from "../monitor/publish/publish-session-monitor.service.ts";

export function installSessionActivityEvents(pi: ExtensionAPI, state: SessionMonitorState): void {
  pi.on("before_agent_start", async (_event, ctx) => {
    latchSessionHistory(state);
    await refreshSessionContext(state, ctx);
  });
  pi.on("message_start", async (event, ctx) => {
    if (event.message.role !== "user") return;
    latchSessionHistory(state);
    await refreshSessionContext(state, ctx);
  });
  pi.on("user_bash", () => {
    state.userBash = true;
    latchSessionHistory(state);
  });
  pi.on("agent_start", async (_event, ctx) => {
    if (state.session.state === "absent" || ctx.mode !== PI_INTERACTIVE_MODE) return;
    state.session.value.context = ctx;
    state.agentActive = true;
    await publishSessionMonitor(state);
  });
  pi.on("agent_settled", async (event, ctx) => {
    if (state.session.state === "absent" || ctx.mode !== PI_INTERACTIVE_MODE) return;
    const session = state.session.value;
    session.context = ctx;
    const shouldNotify = state.agentActive && !event.aborted;
    state.agentActive = false;
    try {
      await publishSessionMonitor(state);
    } finally {
      if (shouldNotify) await notifyCompletion(session, ctx);
    }
  });
}

async function refreshSessionContext(state: SessionMonitorState, ctx: ExtensionContext): Promise<void> {
  if (state.session.state === "absent") return;
  state.session.value.context = ctx;
  await publishSessionMonitor(state);
}

async function notifyCompletion(session: MonitoredSession, ctx: ExtensionContext): Promise<void> {
  if (session.name.state === "absent") return;
  try {
    await session.herdr.notifyCompletion(session.name.value);
  } catch (error) {
    ctx.ui.notify(`Completion notification failed: ${String(error)}`, "warning");
  }
}
