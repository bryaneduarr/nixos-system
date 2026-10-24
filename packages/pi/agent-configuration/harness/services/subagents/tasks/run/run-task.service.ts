import { APPROVED_COMMAND_TOOL } from "../../../../constants/subagents/roles/roles.constant.ts";
import {
  ABORTED_STOP_REASON,
  ERROR_STOP_REASON,
} from "../../../../constants/subagents/tasks/messages/stop-reason.constant.ts";
import { DEFAULT_TASK_REASONING_LEVEL } from "../../../../constants/subagents/tasks/model/reasoning.constant.ts";
import {
  COMPLETED_TASK_LABEL,
  STOPPED_TASK_LABEL,
  TIMED_OUT_ERROR_MESSAGE,
} from "../../../../constants/subagents/tasks/progress/progress.constant.ts";
import { createApprovedCommandTool } from "../../../../tools/approved-command/approved-command.tool.ts";
import type { TaskResult } from "../../../../types/subagents/result/task-result.interface.ts";
import type { TaskProgress } from "../../../../types/subagents/tasks/progress/task-progress.interface.ts";
import type { TaskStatus } from "../../../../types/subagents/tasks/progress/task-status.interface.ts";
import type { RunTaskInput } from "../../../../types/subagents/tasks/run/run-task-input.interface.ts";
import type { TaskRequest } from "../../../../types/subagents/tasks/run/task-request.interface.ts";
import { toValueState } from "../../../activity/value/to-value-state.service.ts";
import { parseTaskOutput } from "../../result/parse-task-output.service.ts";
import { buildTaskSystemPrompt } from "../../roles/build-task-system-prompt.service.ts";
import { resolveTaskRole } from "../../roles/resolve-task-role.service.ts";
import { finalAssistantText } from "../messages/final-assistant-text.service.ts";
import { readAssistantOutcome } from "../messages/read-assistant-outcome.service.ts";
import { usageFromMessages } from "../messages/usage-from-messages.service.ts";
import { createTaskModelRuntime } from "../model/create-task-model-runtime.service.ts";
import { describeTaskModel } from "../model/describe-task-model.service.ts";
import { resolveTaskModel } from "../model/resolve-task-model.service.ts";
import { createTaskProgress } from "../progress/create-task-progress.service.ts";
import { readContextTokens } from "../progress/read-context-tokens.service.ts";
import { trackTaskProgress } from "../progress/track-task-progress.service.ts";
import { composeTaskSystemPrompt } from "./compose-task-system-prompt.service.ts";
import { createTaskResourceLoader } from "./create-task-resource-loader.service.ts";
import { createTaskSession } from "./create-task-session.service.ts";
import { promptTaskSession } from "./prompt-task-session.service.ts";

function taskPrompt(request: TaskRequest): string {
  const contextBlock =
    request.context.state === "present" && request.context.value ? `Context:\n${request.context.value}\n\n` : "";
  return `${contextBlock}Mission:\n${request.mission}`;
}

function taskStatusOf(wasCancelled: boolean, failed: boolean): TaskStatus {
  if (wasCancelled) return "cancelled";

  return failed ? "error" : "success";
}

export async function runTask(input: RunTaskInput): Promise<TaskResult> {
  const { id, request, ctx, signal, onProgress } = input;
  const resolvedRole = resolveTaskRole(request);
  const runtime = await createTaskModelRuntime(ctx);
  const model = resolveTaskModel({
    runtime,
    requestedModel: request.model,
    currentModel: toValueState(ctx.model),
  });
  const resourceLoader = await createTaskResourceLoader({
    cwd: ctx.cwd,
    systemPrompt: composeTaskSystemPrompt({
      provider: model.provider,
      parentPrompt: ctx.getSystemPrompt(),
      rolePrompt: buildTaskSystemPrompt(resolvedRole),
    }),
    skillNames: request.skills.state === "present" ? request.skills.value : [],
  });
  const customTools = resolvedRole.tools.includes(APPROVED_COMMAND_TOOL)
    ? [createApprovedCommandTool(resolvedRole.verificationCommands)]
    : [];
  const session = await createTaskSession({
    cwd: ctx.cwd,
    model,
    runtime,
    thinkingLevel:
      request.reasoning.state === "present"
        ? request.reasoning.value
        : (ctx.thinkingLevel ?? DEFAULT_TASK_REASONING_LEVEL),
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
    const { promptError } = promptOutcome;
    const promptErrors = promptError.state === "present" && promptError.value !== "" ? [promptError.value] : [];

    const isAbortRequested = signal.aborted;
    const isStoppedByAbort =
      assistant.stopReason.state === "present" && assistant.stopReason.value === ABORTED_STOP_REASON;
    const wasCancelled = isAbortRequested || promptOutcome.timedOut || isStoppedByAbort;
    const hasPromptError = promptErrors.length > 0;
    const hasErrorStopReason =
      assistant.stopReason.state === "present" && assistant.stopReason.value === ERROR_STOP_REASON;
    const hasNoOutput = output === "";
    const failed = hasPromptError || hasErrorStopReason || hasNoOutput;

    progress.status = taskStatusOf(wasCancelled, failed);
    progress.currentTask = progress.status === "success" ? COMPLETED_TASK_LABEL : STOPPED_TASK_LABEL;
    publish();

    const errors = [
      ...parsedOutput.errors,
      ...(promptOutcome.timedOut ? [TIMED_OUT_ERROR_MESSAGE] : []),
      ...promptErrors,
      ...(assistant.errorMessage.state === "present" ? [assistant.errorMessage.value] : []),
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
