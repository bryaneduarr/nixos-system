import type { AgentSession } from "@earendil-works/pi-coding-agent";
import { createAgentSession, SessionManager, SettingsManager } from "@earendil-works/pi-coding-agent";
import type { CreateTaskSessionInput } from "../../../../types/subagents/tasks/run/create-task-session-input.interface.ts";

export async function createTaskSession(input: CreateTaskSessionInput): Promise<AgentSession> {
  const { session } = await createAgentSession({
    cwd: input.cwd,
    model: input.model,
    modelRuntime: input.runtime,
    thinkingLevel: input.thinkingLevel,
    tools: [...input.tools],
    customTools: [...input.customTools],
    resourceLoader: input.resourceLoader,
    settingsManager: SettingsManager.inMemory(),
    sessionManager: SessionManager.inMemory(input.cwd),
  });

  return session;
}
