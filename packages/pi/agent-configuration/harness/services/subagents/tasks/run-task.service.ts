import { type ExtensionContext, ModelRuntime } from "@earendil-works/pi-coding-agent";
import {
  COMPLETED_TASK_LABEL,
  STOPPED_TASK_LABEL,
  TIMED_OUT_ERROR_MESSAGE,
} from "../../../constants/subagents/progress.constant.ts";
import { DEFAULT_TASK_REASONING_LEVEL } from "../../../constants/subagents/reasoning.constant.ts";
import { APPROVED_COMMAND_TOOL } from "../../../constants/subagents/roles.constant.ts";
import { ABORTED_STOP_REASON, ERROR_STOP_REASON } from "../../../constants/subagents/stop-reason.constant.ts";
import { createApprovedCommandTool } from "../../../tools/approved-command/approved-command.tool.ts";
import type { SubagentProgressListener } from "../../../types/subagents/registry/subagent-progress-listener.interface.ts";
import type { TaskProgress } from "../../../types/subagents/tasks/task-progress.interface.ts";
import type { TaskRequest } from "../../../types/subagents/tasks/task-request.interface.ts";
import type { TaskResult } from "../../../types/subagents/tasks/task-result.interface.ts";
import type { TaskStatus } from "../../../types/subagents/tasks/task-status.interface.ts";
import { presentValue } from "../../activity/value/present-value.service.ts";
import { toValueState } from "../../activity/value/to-value-state.service.ts";
import { buildTaskSystemPrompt } from "../roles/build-task-system-prompt.service.ts";
import { resolveTaskRole } from "../roles/resolve-task-role.service.ts";
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

function taskPrompt(request: TaskRequest): string {
  const context = presentValue(request.context);
  const contextBlock = context ? `Context:\n${context}\n\n` : "";
  return `${contextBlock}Mission:\n${request.mission}`;
}

function taskStatusOf(wasCancelled: boolean, failed: boolean): TaskStatus {
  if (wasCancelled) return "cancelled";

  return failed ? "error" : "success";
}

export async function runTask(
  id: string,
  request: TaskRequest,
  ctx: ExtensionContext,
  signal: AbortSignal,
  onProgress: SubagentProgressListener,
): Promise<TaskResult> {
  const resolvedRole = resolveTaskRole(request);
  const runtime = await ModelRuntime.create();
  const model = resolveTaskModel({
    runtime,
    requestedModel: request.model,
    currentModel: toValueState(ctx.model),
  });
  const resourceLoader = await createTaskResourceLoader({
    cwd: ctx.cwd,
    systemPrompt: buildTaskSystemPrompt(resolvedRole),
    skillNames: presentValue(request.skills) ?? [],
  });
  const customTools = resolvedRole.tools.includes(APPROVED_COMMAND_TOOL)
    ? [createApprovedCommandTool(resolvedRole.verificationCommands)]
    : [];
  const session = await createTaskSession({
    cwd: ctx.cwd,
    model,
    runtime,
    thinkingLevel: presentValue(request.reasoning) ?? ctx.thinkingLevel ?? DEFAULT_TASK_REASONING_LEVEL,
    tools: resolvedRole.tools,
    customTools,
    resourceLoader,
  });

  const progress: TaskProgress = {
    ...createTaskProgress(id, request.title, resolvedRole),
    model: { state: "present", value: describeTaskModel(model) },
    thinkingLevel: toValueState(session.thinkingLevel),
  };
  const publish = () => onProgress({ ...progress, activity: [...progress.activity] });
  const unsubscribe = trackTaskProgress({ session, progress, publish });
  publish();

  try {
    const promptOutcome = await promptTaskSession({
      session,
      prompt: taskPrompt(request),
      signal,
      timeoutMs: request.timeoutMs,
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

    const isAbortRequested = signal.aborted;
    const isStoppedByAbort = stopReason === ABORTED_STOP_REASON;
    const wasCancelled = isAbortRequested || promptOutcome.timedOut || isStoppedByAbort;
    const hasPromptError = Boolean(promptErrorText);
    const hasErrorStopReason = stopReason === ERROR_STOP_REASON;
    const hasNoOutput = output === "";
    const failed = hasPromptError || hasErrorStopReason || hasNoOutput;

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
