import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { MonitoredSession } from "../../../../types/sessions/monitor/monitored-session.interface.ts";
import type { SessionMonitorState } from "../../../../types/sessions/monitor/session-monitor-state.interface.ts";
import { canCleanup } from "../../cleanup/after-exit/can-cleanup.service.ts";
import { applySessionName } from "./apply-session-name.service.ts";
import { buildSessionRow } from "./build-session-row.service.ts";
import { hasConversationEntries } from "./has-conversation-entries.service.ts";
import { latchSessionHistory } from "./latch-session-history.service.ts";
import { refreshSessionBranch } from "./refresh-session-branch.service.ts";
import { reportSessionIfChanged } from "./report-session-if-changed.service.ts";

export function publishSessionMonitor(state: SessionMonitorState): Promise<void> {
  if (state.session.state === "absent") return Promise.resolve();
  const session = state.session.value;
  if (session.publishing.state === "present") return session.publishing.value;
  const ctx = session.context;
  const hasConversation = hasConversationEntries(ctx);
  if (hasConversation) latchSessionHistory(state);
  const publishing = publishMonitoredRow(state, session, ctx).finally(() => {
    session.publishing = { state: "absent" };
  });
  session.publishing = { state: "present", value: publishing };
  return publishing;
}

async function publishMonitoredRow(
  state: SessionMonitorState,
  session: MonitoredSession,
  ctx: ExtensionContext,
): Promise<void> {
  await refreshSessionBranch(state, session.cwd);
  const name = await session.registry.instanceName(session.cwd, session.identity);
  session.name = { state: "present", value: name };
  const row = await buildSessionRow({ state, session, ctx, name });
  row.cleanupSafe = canCleanup({ row, ctx, compacting: state.compacting, userBash: state.userBash });
  session.latest = { state: "present", value: row };
  await reportSessionIfChanged({ session, row, ctx });
  await session.registry.publish(row);
  await applySessionName(session, name);
}
