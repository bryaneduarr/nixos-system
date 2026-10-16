import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { BRANCH_REFRESH_INTERVAL_MS } from "../../../constants/sessions/monitor.constant.ts";
import {
  CONVERSATION_ENTRY_TYPES,
  CONVERSATION_MESSAGE_ROLES,
} from "../../../constants/sessions/monitor-events.constant.ts";
import type { MonitoredSession } from "../../../types/sessions/monitor/monitored-session.interface.ts";
import type { SessionMonitorState } from "../../../types/sessions/monitor/session-monitor-state.interface.ts";
import type { LiveSession } from "../../../types/sessions/registry/live-session.interface.ts";
import { canCleanup } from "../cleanup/can-cleanup.service.ts";
import { processStartIdentity } from "../registry/process-start-identity.service.ts";
import { sessionStatus } from "../registry/session-status.service.ts";
import { latchSessionHistory } from "./latch-session-history.service.ts";
import { readGitBranch } from "./read-git-branch.service.ts";
import { readSessionContext } from "./read-session-context.service.ts";

export function publishSessionMonitor(state: SessionMonitorState): Promise<void> {
  if (state.session.state === "absent") return Promise.resolve();
  const session = state.session.value;
  if (session.publishing.state === "present") return session.publishing.value;
  const ctx = session.context;
  const hasConversation = ctx.sessionManager.getEntries().some((entry) => {
    if (CONVERSATION_ENTRY_TYPES.includes(entry.type)) return true;
    if (entry.type !== "message") return false;
    return CONVERSATION_MESSAGE_ROLES.includes(entry.message.role);
  });
  if (hasConversation) latchSessionHistory(state);
  const publishing = publishSessionRow(state, session, ctx).finally(() => {
    session.publishing = { state: "absent" };
  });
  session.publishing = { state: "present", value: publishing };
  return publishing;
}

async function publishSessionRow(
  state: SessionMonitorState,
  session: MonitoredSession,
  ctx: ExtensionContext,
): Promise<void> {
  if (Date.now() - state.branchUpdatedAt >= BRANCH_REFRESH_INTERVAL_MS) {
    state.branch = await readGitBranch(session.cwd);
    state.branchUpdatedAt = Date.now();
  }
  const name = await session.registry.instanceName(session.cwd, session.identity);
  session.name = { state: "present", value: name };
  const editor = ctx.ui.getEditorText();
  const working = !ctx.isIdle() || ctx.hasPendingMessages() || state.compacting || !!ctx.signal;
  const processStart = await processStartIdentity(process.pid);
  const row: LiveSession = {
    identity: session.identity,
    pid: process.pid,
    updatedAt: Date.now(),
    cwd: session.cwd,
    pane: session.pane.pane,
    tab: session.pane.tab,
    workspace: session.pane.workspace,
    sessionId: ctx.sessionManager.getSessionId(),
    name,
    branch: state.branch,
    processStart,
    context: readSessionContext(ctx),
    status: sessionStatus(working, editor),
    owned: session.identity === process.env.PI_MANAGED_SESSION,
    historyEver: state.historyEver,
    cleanupSafe: false,
  };
  row.cleanupSafe = canCleanup(row, ctx, state.compacting, state.userBash);
  session.latest = { state: "present", value: row };
  const path = ctx.sessionManager.getSessionFile();
  const reportKey = `${row.sessionId}:${row.status}:${path || ""}`;
  if (session.reported.state === "absent" || session.reported.value !== reportKey) {
    await session.herdr.report(row, path ? { kind: "file", path } : { kind: "identifier" });
    session.reported = { state: "present", value: reportKey };
  }
  await session.registry.publish(row);
  if (session.named.state === "absent" || session.named.value !== name) {
    if (await session.herdr.name(session.pane, name)) session.named = { state: "present", value: name };
  }
}
