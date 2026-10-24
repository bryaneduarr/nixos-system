import { randomUUID } from "node:crypto";
import type { HerdrCommand } from "../../../types/sessions/herdr/command/herdr-command.interface.ts";
import type { LiveSession } from "../../../types/sessions/registry/row/live-session.interface.ts";
import type { SessionRegistry } from "../../../types/sessions/registry/row/session-registry.interface.ts";
import { processStartIdentity } from "../registry/identity/process-start-identity.service.ts";

const SAMPLE_ACTIVE_SESSIONS = 3;

export function createRenumberCommand(registry: SessionRegistry, root: string, sessions: LiveSession[]): HerdrCommand {
  return async (args) => {
    if (args[1] !== "current") return {};
    if (sessions.length === 0) {
      for (let index = 0; index < SAMPLE_ACTIVE_SESSIONS; index++) {
        const row = await createOtherSession(registry, root, index);
        sessions.push(row);
        await registry.publish(row);
      }
    }
    return { pane: { pane_id: "w1:p1", tab_id: "w1:t1", workspace_id: "w1" } };
  };
}

async function createOtherSession(registry: SessionRegistry, root: string, index: number): Promise<LiveSession> {
  const identity = randomUUID();
  return {
    identity,
    name: await registry.instanceName(root, identity),
    cwd: root,
    pid: process.pid,
    updatedAt: Date.now(),
    pane: `w1:p${index + 2}`,
    tab: "w1:t1",
    workspace: "w1",
    sessionId: `other-${index}`,
    branch: "no git",
    processStart: await processStartIdentity(process.pid),
    context: { usageState: "unavailable" },
    status: "idle",
    owned: true,
    historyEver: false,
    cleanupSafe: false,
  };
}
