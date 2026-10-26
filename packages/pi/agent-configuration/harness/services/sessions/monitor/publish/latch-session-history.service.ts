import { usedSessionIdentities } from "../../../../stores/sessions/used-session-identities.store.ts";
import type { SessionMonitorState } from "../../../../types/sessions/monitor/session-monitor-state.interface.ts";

export function latchSessionHistory(state: SessionMonitorState): void {
  state.historyEver = true;
  if (state.session.state === "absent") return;
  const session = state.session.value;
  if (session.latest.state === "present") session.latest.value.historyEver = true;
  usedSessionIdentities.add(session.identity);
}
