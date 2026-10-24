import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { SHUTDOWN_KEEPS_NAME_REASONS } from "../../../constants/sessions/monitor/monitor-events.constant.ts";
import type { SessionDependencies } from "../../../types/sessions/install/session-dependencies.interface.ts";
import type { SessionMonitorState } from "../../../types/sessions/monitor/session-monitor-state.interface.ts";
import { startSessionMonitor } from "../monitor/lifecycle/start-session-monitor.service.ts";
import { stopSessionMonitor } from "../monitor/lifecycle/stop-session-monitor.service.ts";

export function installSessionLifecycleEvents(
  pi: ExtensionAPI,
  state: SessionMonitorState,
  dependencies: SessionDependencies,
): void {
  pi.on("session_start", async (_event, ctx) => startSessionMonitor(state, ctx, dependencies));
  pi.on("session_shutdown", (event) => stopSessionMonitor(state, SHUTDOWN_KEEPS_NAME_REASONS.includes(event.reason)));
}
