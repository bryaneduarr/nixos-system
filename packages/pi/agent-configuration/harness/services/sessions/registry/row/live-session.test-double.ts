import { randomUUID } from "node:crypto";
import type { LiveSession } from "../../../../types/sessions/registry/row/live-session.interface.ts";
import { processStartIdentity } from "../identity/process-start-identity.service.ts";

const CURRENT_PROCESS_START = await processStartIdentity(process.pid);

export function createLiveSession(overrides: Partial<LiveSession> = {}): LiveSession {
  return {
    identity: randomUUID(),
    pid: process.pid,
    processStart: CURRENT_PROCESS_START,
    updatedAt: Date.now(),
    cwd: "/tmp/sample-project",
    pane: "w2:p3",
    tab: "w2:t2",
    workspace: "w2",
    sessionId: "session-a",
    name: "test",
    branch: "main",
    context: { usageState: "unavailable" },
    status: "idle",
    owned: false,
    historyEver: false,
    cleanupSafe: false,
    ...overrides,
  };
}
