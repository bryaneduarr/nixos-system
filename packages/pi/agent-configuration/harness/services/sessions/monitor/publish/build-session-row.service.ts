import { PI_MANAGED_SESSION_VARIABLE } from "../../../../constants/sessions/install/environment.constant.ts";
import type { SessionRowBuild } from "../../../../types/sessions/monitor/session-row-build.interface.ts";
import type { LiveSession } from "../../../../types/sessions/registry/row/live-session.interface.ts";
import { processStartIdentity } from "../../registry/identity/process-start-identity.service.ts";
import { sessionStatus } from "../../registry/row/session-status.service.ts";
import { isSessionWorking } from "./is-session-working.service.ts";
import { readSessionContext } from "./read-session-context.service.ts";

export async function buildSessionRow(build: SessionRowBuild): Promise<LiveSession> {
  const { state, session, ctx, name } = build;
  const editor = ctx.ui.getEditorText();
  const working = isSessionWorking(ctx, state.compacting);
  const processStart = await processStartIdentity(process.pid);
  return {
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
    owned: session.identity === process.env[PI_MANAGED_SESSION_VARIABLE],
    historyEver: state.historyEver,
    cleanupSafe: false,
  };
}
