import { type ExtensionContext, ModelRuntime } from "@earendil-works/pi-coding-agent";
import {
  COMPLETED_TASK_LABEL,
  STOPPED_TASK_LABEL,
  TIMED_OUT_ERROR_MESSAGE,
} from "../../../constants/subagents/progress.constant.ts";
import { APPROVED_COMMAND_TOOL } from "../../../constants/subagents/roles.constant.ts";
import { createApprovedCommandTool } from "../../../tools/approved-command/approved-command.tool.ts";
import type { SubagentProgressListener } from "../../../types/subagents/registry/subagent-progress-listener.interface.ts";
import type { TaskInput } from "../../../types/subagents/tasks/task-input.interface.ts";
import type { TaskProgress } from "../../../types/subagents/tasks/task-progress.interface.ts";
import type { TaskResult } from "../../../types/subagents/tasks/task-result.interface.ts";
import type { TaskStatus } from "../../../types/subagents/tasks/task-status.interface.ts";
import { presentValue } from "../../activity/value/present-value.service.ts";
import { toValueState } from "../../activity/value/to-value-state.service.ts";
import { buildTaskSystemPrompt } from "../roles/build-task-system-prompt.service.ts";
import { resolveTaskRole } from "../roles/resolve-task-role.service.ts";
import { toTaskRoleInput } from "../roles/to-task-role-input.service.ts";
import { createTaskProgress } from "./create-task-progress.service.ts";
import { createTaskResourceLoader } from "./create-task-resource-loader.service.ts";
import { createTaskSession } from "./create-task-session.service.ts";
import { describeTaskModel } from "./describe-task-model.service.ts";
import { finalAssistantText } from "./final-assistant-text.service.ts";
import { parseTaskOutput } from "./parse-task-output.service.ts";
import { promptTaskSession } from "./prompt-task-session.service.ts";
import { readAssistantOutcome } from "./read-assistant-outcome.service.ts";
import { readContextTokens } from "./read-context-tokens.service.ts";
import { resolveTaskModel } from "./resolve-task-model.service.ts";
import { trackTaskProgress } from "./track-task-progress.service.ts";
import { usageFromMessages } from "./usage-from-messages.service.ts";

function taskPrompt(input: TaskInput): string {
  const context = input.context ? `Context:\n${input.context}\n\n` : "";
  return `${context}Mission:\n${input.mission}`;
}

function taskStatusOf(wasCancelled: boolean, failed: boolean): TaskStatus {
  if (wasCancelled) return "cancelled";

  return failed ? "error" : "success";
}

export async function runTask(
  id: string,
  input: TaskInput,
  ctx: ExtensionContext,
  signal: AbortSignal | undefined,
  onProgress: SubagentProgressListener,
): Promise<TaskResult> {
  const resolvedRole = resolveTaskRole(toTaskRoleInput(input));
  const runtime = await ModelRuntime.create();
  const model = resolveTaskModel({
    runtime,
    requestedModel: toValueState(input.model),
    currentModel: toValueState(ctx.model),
  });
  const resourceLoader = await createTaskResourceLoader({
    cwd: ctx.cwd,
    systemPrompt: buildTaskSystemPrompt(resolvedRole),
    skillNames: input.skills ?? [],
  });
  const customTools = resolvedRole.tools.includes(APPROVED_COMMAND_TOOL)
    ? [createApprovedCommandTool(resolvedRole.verificationCommands)]
    : [];
  const session = await createTaskSession({
    cwd: ctx.cwd,
    model,
    runtime,
    thinkingLevel: input.reasoning ?? ctx.thinkingLevel ?? "medium",
    tools: resolvedRole.tools,
    customTools,
    resourceLoader,
  });

  const progress: TaskProgress = {
    ...createTaskProgress(id, input.title, resolvedRole),
    model: { state: "present", value: describeTaskModel(model) },
    thinkingLevel: toValueState(session.thinkingLevel),
  };
  const publish = () => onProgress({ ...progress, activity: [...progress.activity] });
  const unsubscribe = trackTaskProgress({ session, progress, publish });
  publish();

  try {
    const promptOutcome = await promptTaskSession({
      session,
      prompt: taskPrompt(input),
      signal,
      timeoutMs: toValueState(input.timeoutMs),
    });

    progress.usage = {
      usageState: "reported",
      usage: usageFromMessages(session.messages, readContextTokens(session)),
    };
    const output = finalAssistantText(session.messages);
    const parsedOutput = parseTaskOutput(output);
    const assistant = readAssistantOutcome(session.messages);
    const stopReason = presentValue(assistant.stopReason);
    const promptErrorText = presentValue(promptOutcome.promptError);
    const wasCancelled = signal?.aborted === true || promptOutcome.timedOut || stopReason === "aborted";
    const failed = Boolean(promptErrorText) || stopReason === "error" || !output;

    progress.status = taskStatusOf(wasCancelled, failed);
    progress.currentTask = progress.status === "success" ? COMPLETED_TASK_LABEL : STOPPED_TASK_LABEL;
    publish();

    const assistantErrorMessage = presentValue(assistant.errorMessage);
    const errors = [
      ...parsedOutput.errors,
      ...(promptOutcome.timedOut ? [TIMED_OUT_ERROR_MESSAGE] : []),
      ...(promptErrorText ? [promptErrorText] : []),
      ...(assistantErrorMessage === undefined ? [] : [assistantErrorMessage]),
    ];

    return {
      ...progress,
      ...parsedOutput,
      errors,
    };
  } finally {
    unsubscribe();
    session.dispose();
  }
}
