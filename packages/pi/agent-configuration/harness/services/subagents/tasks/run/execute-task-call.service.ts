import type { SubagentRegistry } from "../../../../types/subagents/registry/subagent-registry.interface.ts";
import type { TaskResult } from "../../../../types/subagents/result/task-result.interface.ts";
import type { TaskProgress } from "../../../../types/subagents/tasks/progress/task-progress.interface.ts";
import type { TaskProgressLookup } from "../../../../types/subagents/tasks/progress/task-progress-lookup.interface.ts";
import type { ExecuteTaskCallInput } from "../../../../types/subagents/tasks/run/execute-task-call-input.interface.ts";
import type { ToolCancellation } from "../../../../types/tools/process/tool-cancellation.interface.ts";
import { formatTaskErrorResult } from "../../result/format-task-error-result.service.ts";
import { formatTaskResult } from "../../result/format-task-result.service.ts";
import { createFailedTaskProgress } from "../progress/create-failed-task-progress.service.ts";

interface TaskCallOutcome {
  readonly text: string;
  readonly details: TaskResult | TaskProgress;
}

function cancelOnAbort(cancellation: ToolCancellation, registry: SubagentRegistry, id: string): () => void {
  switch (cancellation.kind) {
    case "uncancellable":
      return () => {};
    case "abortable": {
      const { signal } = cancellation;
      const abort = () => {
        registry.cancel(id);
      };
      signal.addEventListener("abort", abort, { once: true });
      if (signal.aborted) abort();

      return () => signal.removeEventListener("abort", abort);
    }
    default:
      return cancellation satisfies never;
  }
}

export async function executeTaskCall(input: ExecuteTaskCallInput): Promise<TaskCallOutcome> {
  const { registry, request, ctx, cancellation, onProgress } = input;
  let latest: TaskProgressLookup = { found: false };
  const handle = registry.create(request, ctx, (progress) => {
    latest = { found: true, progress };
    onProgress(progress);
  });
  const stopWatching = cancelOnAbort(cancellation, registry, handle.id);

  try {
    const taskResult = await handle.result;
    return { text: formatTaskResult(taskResult), details: taskResult };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const failedProgress = createFailedTaskProgress(latest, handle.id, request);
    return { text: formatTaskErrorResult(failedProgress.id, request.title, message), details: failedProgress };
  } finally {
    stopWatching();
  }
}
