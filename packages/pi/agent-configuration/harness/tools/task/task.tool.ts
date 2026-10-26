import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { renderSubagentCard } from "../../components/subagents/subagent-card.component.ts";
import { EMPTY } from "../../components/tool-rendering/empty.component.ts";
import { TASK_TOOL_NAME } from "../../constants/subagents/roles/roles.constant.ts";
import {
  TASK_PROMPT_GUIDELINES,
  TASK_PROMPT_SNIPPET,
  TASK_TOOL_DESCRIPTION,
  TASK_TOOL_LABEL,
} from "../../constants/subagents/tasks/run/tool-description.constant.ts";
import { TaskParams } from "../../schemas/subagents/tasks/run/task-params.schema.ts";
import { toValueState } from "../../services/activity/value/to-value-state.service.ts";
import { readTaskProgress } from "../../services/subagents/tasks/progress/read-task-progress.service.ts";
import { executeTaskCall } from "../../services/subagents/tasks/run/execute-task-call.service.ts";
import { toTaskRequest } from "../../services/subagents/tasks/run/to-task-request.service.ts";
import { toToolCancellation } from "../../services/tools/process/tool-cancellation.service.ts";
import { subagentRegistry } from "../../stores/subagents/subagent-registry.store.ts";

export function registerTaskTool(pi: ExtensionAPI): void {
  pi.registerTool({
    name: TASK_TOOL_NAME,
    label: TASK_TOOL_LABEL,
    description: TASK_TOOL_DESCRIPTION,
    promptSnippet: TASK_PROMPT_SNIPPET,
    promptGuidelines: TASK_PROMPT_GUIDELINES,
    parameters: TaskParams,
    executionMode: "parallel",
    renderShell: "self",
    renderCall(args, theme, context) {
      const isPreparingCall = context.isPartial && !context.executionStarted;
      if (!isPreparingCall) return EMPTY;

      return renderSubagentCard({
        theme,
        toolCallId: context.toolCallId,
        title: args.title,
        progressLookup: { found: false },
        lastComponent: toValueState(context.lastComponent),
      });
    },
    renderResult(toolResult, _options, theme, context) {
      return renderSubagentCard({
        theme,
        toolCallId: context.toolCallId,
        title: context.args.title,
        progressLookup: readTaskProgress(toolResult.details),
        lastComponent: toValueState(context.lastComponent),
      });
    },
    async execute(_toolCallId, params, signal, onUpdate, ctx) {
      const outcome = await executeTaskCall({
        registry: subagentRegistry,
        request: toTaskRequest(params),
        ctx,
        cancellation: toToolCancellation(signal),
        onProgress: (progress) => {
          if (onUpdate === undefined) return;
          onUpdate({ content: [{ type: "text", text: progress.currentTask }], details: progress });
        },
      });

      return { content: [{ type: "text", text: outcome.text }], details: outcome.details };
    },
  });
}
