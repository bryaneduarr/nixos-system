import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import {
  createAgentSession,
  DefaultResourceLoader,
  getAgentDir,
  ModelRuntime,
  SessionManager,
  SettingsManager,
} from "@earendil-works/pi-coding-agent";
import type { SubagentUsage } from "../activity/store.ts";
import {
  COMPLETED_TASK_LABEL,
  STARTING_TASK_LABEL,
  STOPPED_TASK_LABEL,
  TIMED_OUT_ERROR_MESSAGE,
  WRITING_RESULT_TASK_LABEL,
} from "../constants/subagents/progress.constant.ts";
import { APPROVED_COMMAND_TOOL } from "../constants/subagents/roles.constant.ts";
import { USAGE_FIELDS } from "../constants/subagents/usage.constant.ts";
import type { TaskInput } from "../types/subagents/tasks/task-input.interface.ts";
import type { TaskProgress } from "../types/subagents/tasks/task-progress.interface.ts";
import type { TaskResult } from "../types/subagents/tasks/task-result.interface.ts";
import { createApprovedCommandTool } from "./approved-command.ts";
import { parseTaskOutput } from "./result.ts";
import { buildTaskSystemPrompt, resolveTaskRole } from "./roles.ts";

function textContent(content: unknown): string {
  if (!Array.isArray(content)) return "";

  const textParts = content.filter(
    (part): part is { type: "text"; text: string } =>
      typeof part === "object" && part !== null && part.type === "text" && typeof part.text === "string",
  );

  return textParts.map((part) => part.text).join("\n");
}

function usageFromMessages(messages: readonly unknown[], contextTokens?: number | null): SubagentUsage {
  const usage: SubagentUsage = {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    reasoningTokens: 0,
    totalTokens: 0,
  };

  for (const message of messages) {
    if (!message || typeof message !== "object") continue;
    if ((message as { role?: string }).role !== "assistant") continue;

    const messageUsage = (message as { usage?: Record<string, unknown> }).usage;
    if (!messageUsage) continue;

    for (const [target, source] of USAGE_FIELDS) {
      const value = messageUsage[source];
      if (typeof value !== "number" || !Number.isFinite(value)) continue;

      usage[target] += value;
    }
  }

  usage.totalTokens = usage.inputTokens + usage.outputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
  if (typeof contextTokens === "number" && Number.isFinite(contextTokens)) {
    usage.contextTokens = contextTokens;
  }

  return usage;
}

function finalText(messages: readonly unknown[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (!message || typeof message !== "object") continue;
    if ((message as { role?: string }).role !== "assistant") continue;

    const content = (message as { content?: unknown }).content;
    const text = textContent(content).trim();
    if (text) return text;
  }

  return "";
}

function lastAssistant(messages: readonly unknown[]): Record<string, unknown> | undefined {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (!message || typeof message !== "object") continue;
    if ((message as { role?: unknown }).role !== "assistant") continue;

    return message as Record<string, unknown>;
  }

  return undefined;
}

function describeToolActivity(toolName: string, args: Record<string, unknown>): string {
  const target = Object.values(args).find((value) => typeof value === "string");
  const targetLabel = typeof target === "string" ? target : "";
  return `${toolName} ${targetLabel}`.trim();
}

export async function runTask(
  id: string,
  input: TaskInput,
  ctx: ExtensionContext,
  signal: AbortSignal | undefined,
  onProgress: (progress: TaskProgress) => void,
): Promise<TaskResult> {
  const resolvedRole = resolveTaskRole(input);
  const runtime = await ModelRuntime.create();
  let model = ctx.model;

  if (input.model) {
    const [provider, ...modelParts] = input.model.split("/");
    model = runtime.getModel(provider, modelParts.join("/"));
  }

  if (!model) {
    const modelName = input.model ?? "current model";
    throw new Error(`Unknown model: ${modelName}`);
  }

  const selectedSkills = new Set(input.skills ?? []);
  const loader = new DefaultResourceLoader({
    cwd: ctx.cwd,
    agentDir: getAgentDir(),
    noExtensions: true,
    noPromptTemplates: true,
    noThemes: true,
    noContextFiles: true,
    systemPrompt: buildTaskSystemPrompt(resolvedRole),
    skillsOverride: (base) => ({
      skills: base.skills.filter((skill) => selectedSkills.has(skill.name)),
      diagnostics: base.diagnostics,
    }),
  });
  await loader.reload();

  const foundSkills = new Set(loader.getSkills().skills.map((skill) => skill.name));
  const missingSkills = [...selectedSkills].filter((name) => !foundSkills.has(name));
  if (missingSkills.length > 0) {
    throw new Error(`Unknown skills: ${missingSkills.join(", ")}`);
  }

  const customTools = resolvedRole.tools.includes(APPROVED_COMMAND_TOOL)
    ? [createApprovedCommandTool(resolvedRole.verificationCommands)]
    : [];
  const { session } = await createAgentSession({
    cwd: ctx.cwd,
    model,
    modelRuntime: runtime,
    thinkingLevel: input.reasoning ?? ctx.thinkingLevel ?? "medium",
    tools: resolvedRole.tools,
    customTools,
    resourceLoader: loader,
    settingsManager: SettingsManager.inMemory(),
    sessionManager: SessionManager.inMemory(ctx.cwd),
  });
  const progress: TaskProgress = {
    id,
    title: input.title,
    role: resolvedRole.role,
    tools: [...resolvedRole.tools],
    verificationCommands: [...resolvedRole.verificationCommands],
    currentTask: STARTING_TASK_LABEL,
    status: "running",
    model: {
      provider: model.provider,
      id: model.id,
      name: model.name,
      reasoning: model.reasoning,
      contextWindow: model.contextWindow,
    },
    thinkingLevel: session.thinkingLevel,
    activity: [],
  };
  const publish = () => onProgress({ ...progress, activity: [...progress.activity] });
  const unsubscribe = session.subscribe((event) => {
    if (event.type === "tool_execution_start") {
      const args = (event.args ?? {}) as Record<string, unknown>;
      progress.currentTask = describeToolActivity(event.toolName, args);
      progress.activity.push({
        id: event.toolCallId,
        toolName: event.toolName,
        args,
        status: "running",
        text: "",
        startedAt: Date.now(),
      });
      publish();
      return;
    }

    if (event.type === "tool_execution_end") {
      const call = progress.activity.find((item) => item.id === event.toolCallId);
      if (call) {
        call.status = event.isError ? "error" : "success";
        call.text = textContent(event.result?.content);
        call.endedAt = Date.now();
      }

      const runningCall = progress.activity.findLast((item) => item.status === "running");
      progress.currentTask = runningCall
        ? describeToolActivity(runningCall.toolName, runningCall.args)
        : WRITING_RESULT_TASK_LABEL;
      publish();
      return;
    }

    if (event.type === "message_end" && event.message.role === "assistant") {
      const contextTokens = session.getContextUsage()?.tokens;
      progress.usage = usageFromMessages(session.messages, contextTokens);
      publish();
    }
  });
  publish();

  let timedOut = false;
  const abort = () => {
    void session.abort();
  };
  signal?.addEventListener("abort", abort, { once: true });

  const timer = input.timeoutMs
    ? setTimeout(() => {
        timedOut = true;
        abort();
      }, input.timeoutMs)
    : undefined;

  try {
    let promptError: string | undefined;
    if (signal?.aborted) {
      abort();
    } else {
      const context = input.context ? `Context:\n${input.context}\n\n` : "";
      const prompt = `${context}Mission:\n${input.mission}`;

      try {
        await session.prompt(prompt);
      } catch (error) {
        promptError = error instanceof Error ? error.message : String(error);
      }
    }

    const contextTokens = session.getContextUsage()?.tokens;
    progress.usage = usageFromMessages(session.messages, contextTokens);
    const output = finalText(session.messages);
    const parsedOutput = parseTaskOutput(output);
    const assistant = lastAssistant(session.messages);
    const wasCancelled = signal?.aborted || timedOut || assistant?.stopReason === "aborted";
    const failed = Boolean(promptError || assistant?.stopReason === "error" || !output);

    if (wasCancelled) {
      progress.status = "cancelled";
    } else if (failed) {
      progress.status = "error";
    } else {
      progress.status = "success";
    }

    progress.currentTask = progress.status === "success" ? COMPLETED_TASK_LABEL : STOPPED_TASK_LABEL;
    publish();

    const errors = [
      ...parsedOutput.errors,
      ...(timedOut ? [TIMED_OUT_ERROR_MESSAGE] : []),
      ...(promptError ? [promptError] : []),
      ...(typeof assistant?.errorMessage === "string" ? [assistant.errorMessage] : []),
    ];

    return {
      ...progress,
      ...parsedOutput,
      errors,
    };
  } finally {
    if (timer) clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
    unsubscribe();
    session.dispose();
  }
}
