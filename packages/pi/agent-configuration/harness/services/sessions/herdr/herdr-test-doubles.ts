import { randomUUID } from "node:crypto";
import { join } from "node:path";
import type { LiveSession } from "../../../types/sessions/registry/live-session.interface.ts";
import type { SessionRegistry } from "../../../types/sessions/registry/session-registry.interface.ts";
import { createSessionRegistry } from "../registry/create-session-registry.service.ts";
import { processStartIdentity } from "../registry/process-start-identity.service.ts";

const CURRENT_PROCESS_START = await processStartIdentity(process.pid);

export function createSessionRow(cwd: string, overrides: Partial<LiveSession> = {}): LiveSession {
  return {
    identity: randomUUID(),
    pid: process.pid,
    processStart: CURRENT_PROCESS_START,
    updatedAt: Date.now(),
    cwd,
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

export function createRegistryIn(root: string): SessionRegistry {
  return createSessionRegistry(join(root, randomUUID()));
}
