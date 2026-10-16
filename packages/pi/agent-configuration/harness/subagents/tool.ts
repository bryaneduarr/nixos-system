import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { STOPPED_TASK_LABEL } from "../constants/subagents/progress.constant.ts";
import { TASK_TOOL_NAME } from "../constants/subagents/roles.constant.ts";
import { TaskParams } from "../schemas/subagents/tasks/task-params.schema.ts";
import type { TaskInput } from "../types/subagents/tasks/task-input.interface.ts";
import type { TaskProgress } from "../types/subagents/tasks/task-progress.interface.ts";
import type { TaskResult } from "../types/subagents/tasks/task-result.interface.ts";
import { hiddenSubagentCall, renderSubagentCard } from "./card.ts";
import { subagentRegistry } from "./registry.ts";

const TASK_TOOL_DESCRIPTION = [
  "Run an isolated subagent with a mission, optional role, context, model, reasoning, tools, and skills.",
  "Explore and verify roles stay read-only, and implementation workers run one at a time.",
  "Reports progress and a structured result.",
].join(" ");

const TASK_PROMPT_GUIDELINES = [
  "Use task for bounded independent work. Give it a short title and one specific mission.",
  "Choose explore, implement, or verify when the mission fits that role. Omit role to keep generic task behavior.",
  "Specify only the context, tools, and skills the subagent needs. It does not inherit this conversation.",
  "List exact verificationCommands for implement or verify workers that need to run checks.",
  "Call task multiple times in one response for independent work. Implement workers share one slot.",
];

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

function errorProgress(progress: TaskProgress | undefined, handleId: string, params: TaskInput): TaskProgress {
  return {
    id: progress?.id ?? handleId,
    title: params.title,
    role: progress?.role ?? params.role ?? TASK_TOOL_NAME,
    tools: progress?.tools ?? params.tools ?? [],
    verificationCommands: progress?.verificationCommands ?? params.verificationCommands ?? [],
    currentTask: STOPPED_TASK_LABEL,
    status: "error",
    model: progress === undefined ? { state: "absent" } : progress.model,
    thinkingLevel: progress === undefined ? { state: "absent" } : progress.thinkingLevel,
    activity: progress?.activity ?? [],
    usage: progress === undefined ? { usageState: "unreported" } : progress.usage,
  };
}

export function registerSubagentTool(pi: ExtensionAPI): void {
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
      return renderSubagentCard(
        theme,
        context.toolCallId,
        context.args.title,
        result.details as TaskProgress | undefined,
        context.lastComponent,
      );
    },
    async execute(_toolCallId, params, signal, onUpdate, ctx) {
      let latest: TaskProgress | undefined;
      const publish = (progress: TaskProgress) => {
        latest = progress;
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
        const details = errorProgress(latest, handle.id, params);
        return {
          content: [{ type: "text", text: errorResultContent(details.id, params.title, message) }],
          details,
        };
      } finally {
        signal?.removeEventListener("abort", abort);
      }
    },
  });

  pi.registerCommand("subagent-status", {
    description: "Show the status of active subagents",
    handler: async (args, ctx) => {
      const requestedId = args.trim();
      let runs: TaskProgress[];
      if (requestedId) {
        const matchingRun = subagentRegistry.status(requestedId);
        runs = matchingRun ? [matchingRun] : [];
      } else {
        runs = subagentRegistry.list();
      }
      const status = runs.length
        ? runs.map((run) => `${run.id} · ${run.title} · ${run.status} · ${run.currentTask}`).join("\n")
        : "No matching subagents.";

      ctx.ui.notify(status, "info");
    },
  });

  pi.registerCommand("subagent-cancel", {
    description: "Cancel an active subagent by ID",
    handler: async (args, ctx) => {
      const cancelled = subagentRegistry.cancel(args.trim());
      const status = cancelled ? "Subagent cancellation requested." : "No running subagent with that ID.";
      ctx.ui.notify(status, "info");
    },
  });

  pi.on("session_start", () => subagentRegistry.clear());
  pi.on("session_shutdown", () => subagentRegistry.cancelAll());
}
