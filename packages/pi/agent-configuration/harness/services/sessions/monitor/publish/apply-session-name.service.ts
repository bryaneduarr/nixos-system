import type { MonitoredSession } from "../../../../types/sessions/monitor/monitored-session.interface.ts";

export async function applySessionName(session: MonitoredSession, name: string): Promise<void> {
  const isAlreadyNamed = session.named.state === "present" && session.named.value === name;
  if (isAlreadyNamed) return;
  if (await session.herdr.name(session.pane, name)) session.named = { state: "present", value: name };
}
