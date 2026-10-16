import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { hiddenSubagentCall, renderSubagentCard } from "../../components/subagents/subagent-card.component.ts";
import { TASK_TOOL_NAME } from "../../constants/subagents/roles.constant.ts";
import { TASK_PROMPT_GUIDELINES, TASK_TOOL_DESCRIPTION } from "../../constants/subagents/tool-description.constant.ts";
import { TaskParams } from "../../schemas/subagents/tasks/task-params.schema.ts";
import { subagentRegistry } from "../../services/subagents/registry/shared-subagent-registry.service.ts";
import { createFailedTaskProgress } from "../../services/subagents/tasks/create-failed-task-progress.service.ts";
import { readTaskProgress } from "../../services/subagents/tasks/read-task-progress.service.ts";
import type { TaskProgress } from "../../types/subagents/tasks/task-progress.interface.ts";
import type { TaskProgressLookup } from "../../types/subagents/tasks/task-progress-lookup.interface.ts";
import type { TaskResult } from "../../types/subagents/tasks/task-result.interface.ts";

function resultContent(result: TaskResult): string {
  const content = {
    id: result.id,
    title: result.title,
    role: result.role,
    tools: result.tools,
    verification_commands: result.verificationCommands,
    status: result.status,
    summary: result.summary,
    findings: result.findings,
    unresolved_questions: result.unresolvedQuestions,
    checks: result.checks,
    files_changed: result.filesChanged,
    risks: result.risks,
    errors: result.errors,
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
      if (!context.isPartial || context.executionStarted) return hiddenSubagentCall();

      return renderSubagentCard(theme, context.toolCallId, args.title, undefined, context.lastComponent);
    },
    renderResult(result, _options, theme, context) {
      const lookup = readTaskProgress(result.details);
      return renderSubagentCard(
        theme,
        context.toolCallId,
        context.args.title,
        lookup.found ? lookup.progress : undefined,
        context.lastComponent,
      );
    },
    async execute(_toolCallId, params, signal, onUpdate, ctx) {
      let latest: TaskProgressLookup = { found: false };
      const publish = (progress: TaskProgress) => {
        latest = { found: true, progress };
        onUpdate?.({
          content: [{ type: "text", text: progress.currentTask }],
          details: progress,
        });
      };
      const handle = subagentRegistry.create(params, ctx, publish);
      const abort = () => {
        subagentRegistry.cancel(handle.id);
      };
      signal?.addEventListener("abort", abort, { once: true });

      try {
        if (signal?.aborted) abort();

        const result = await handle.result;
        return {
          content: [{ type: "text", text: resultContent(result) }],
          details: result,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const details = createFailedTaskProgress(latest, handle.id, params);
        return {
          content: [{ type: "text", text: errorResultContent(details.id, params.title, message) }],
          details,
        };
      } finally {
        signal?.removeEventListener("abort", abort);
      }
    },
  });
}
