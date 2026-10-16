import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { hiddenSubagentCall, renderSubagentCard } from "../../components/subagents/subagent-card.component.ts";
import { TASK_TOOL_NAME } from "../../constants/subagents/roles.constant.ts";
import { TASK_PROMPT_GUIDELINES, TASK_TOOL_DESCRIPTION } from "../../constants/subagents/tool-description.constant.ts";
import { TaskParams } from "../../schemas/subagents/tasks/task-params.schema.ts";
import { toValueState } from "../../services/activity/value/to-value-state.service.ts";
import { subagentRegistry } from "../../services/subagents/registry/shared-subagent-registry.service.ts";
import { createFailedTaskProgress } from "../../services/subagents/tasks/create-failed-task-progress.service.ts";
import { readTaskProgress } from "../../services/subagents/tasks/read-task-progress.service.ts";
import { toTaskRequest } from "../../services/subagents/tasks/to-task-request.service.ts";
import type { TaskProgress } from "../../types/subagents/tasks/task-progress.interface.ts";
import type { TaskProgressLookup } from "../../types/subagents/tasks/task-progress-lookup.interface.ts";
import type { TaskResult } from "../../types/subagents/tasks/task-result.interface.ts";

function resultContent(taskResult: TaskResult): string {
  const content = {
    id: taskResult.id,
    title: taskResult.title,
    role: taskResult.role,
    tools: taskResult.tools,
    verification_commands: taskResult.verificationCommands,
    status: taskResult.status,
    summary: taskResult.summary,
    findings: taskResult.findings,
    unresolved_questions: taskResult.unresolvedQuestions,
    checks: taskResult.checks,
    files_changed: taskResult.filesChanged,
    risks: taskResult.risks,
    errors: taskResult.errors,
  };

  return JSON.stringify(content);
}

function errorResultContent(id: string, title: string, message: string): string {
  const content = {
    id,
    title,
    status: "error",
    summary: "",
    findings: [],
    files_changed: [],
    errors: [message],
  };

  return JSON.stringify(content);
}

export function registerTaskTool(pi: ExtensionAPI): void {
  pi.registerTool({
    name: TASK_TOOL_NAME,
    label: "Subagent",
    description: TASK_TOOL_DESCRIPTION,
    promptSnippet: "Delegate a bounded mission to a subagent with a selected role",
    promptGuidelines: TASK_PROMPT_GUIDELINES,
    parameters: TaskParams,
    executionMode: "parallel",
    renderShell: "self",
    renderCall(args, theme, context) {
      const isPreparingCall = context.isPartial && !context.executionStarted;
      if (!isPreparingCall) return hiddenSubagentCall();

      return renderSubagentCard(
        theme,
        context.toolCallId,
        args.title,
        { found: false },
        toValueState(context.lastComponent),
      );
    },
    renderResult(toolResult, _options, theme, context) {
      return renderSubagentCard(
        theme,
        context.toolCallId,
        context.args.title,
        readTaskProgress(toolResult.details),
        toValueState(context.lastComponent),
      );
    },
    async execute(_toolCallId, params, signal, onUpdate, ctx) {
      const request = toTaskRequest(params);
      let latest: TaskProgressLookup = { found: false };
      const publish = (progress: TaskProgress) => {
        latest = { found: true, progress };
        onUpdate?.({
          content: [{ type: "text", text: progress.currentTask }],
          details: progress,
        });
      };
      const handle = subagentRegistry.create(request, ctx, publish);
      const abort = () => {
        subagentRegistry.cancel(handle.id);
      };
      signal?.addEventListener("abort", abort, { once: true });

      try {
        if (signal?.aborted) abort();

        const taskResult = await handle.result;
        return {
          content: [{ type: "text", text: resultContent(taskResult) }],
          details: taskResult,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const failedProgress = createFailedTaskProgress(latest, handle.id, request);
        return {
          content: [{ type: "text", text: errorResultContent(failedProgress.id, request.title, message) }],
          details: failedProgress,
        };
      } finally {
        signal?.removeEventListener("abort", abort);
      }
    },
  });
}
