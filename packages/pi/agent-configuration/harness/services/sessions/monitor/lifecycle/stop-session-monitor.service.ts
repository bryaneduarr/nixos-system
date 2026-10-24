import type { SessionMonitorState } from "../../../../types/sessions/monitor/session-monitor-state.interface.ts";

export async function stopSessionMonitor(state: SessionMonitorState, preserveName: boolean): Promise<void> {
  state.agentActive = false;
  state.branchUpdatedAt = 0;
  if (state.session.state === "absent") return;
  const session = state.session.value;
  state.session = { state: "absent" };
  if (session.timer.state === "present") clearInterval(session.timer.value);
  if (session.removeInputListener.state === "present") session.removeInputListener.value();
  if (session.publishing.state === "present") await session.publishing.value.catch(() => {});
  if (session.latest.state === "present") await session.herdr.release(session.latest.value).catch(() => {});
  await session.registry.remove(session.identity, preserveName);
}
