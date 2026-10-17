import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SessionMonitorState } from "../../../types/sessions/monitor/session-monitor-state.interface.ts";

export function installSessionCompactionEvents(pi: ExtensionAPI, state: SessionMonitorState): void {
  pi.on("session_before_compact", (_event, ctx) => setCompacting(state, ctx, true));
  pi.on("session_compact", (_event, ctx) => setCompacting(state, ctx, false));
  pi.on("session_compact_failed", (_event, ctx) => setCompacting(state, ctx, false));
}

function setCompacting(state: SessionMonitorState, ctx: ExtensionContext, compacting: boolean): void {
  if (state.session.state === "absent") return;
  state.compacting = compacting;
  state.session.value.context = ctx;
}
