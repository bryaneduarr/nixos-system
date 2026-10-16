import { randomUUID } from "node:crypto";
import { STOPPED_TASK_LABEL } from "../../../constants/subagents/progress.constant.ts";
import type { SubagentRegistry } from "../../../types/subagents/registry/subagent-registry.interface.ts";
import type { SubagentRun } from "../../../types/subagents/registry/subagent-run.interface.ts";
import { resolveTaskRole } from "../roles/resolve-task-role.service.ts";
import { toTaskRoleInput } from "../roles/to-task-role-input.service.ts";
import { createTaskProgress } from "../tasks/create-task-progress.service.ts";
import { runTask } from "../tasks/run-task.service.ts";
import { createImplementationQueue } from "./create-implementation-queue.service.ts";

export function createSubagentRegistry(): SubagentRegistry {
  const implementationQueue = createImplementationQueue();
  const runsById = new Map<string, SubagentRun>();

  const cancel = (id: string): boolean => {
    const run = runsById.get(id);
    if (run?.progress.status !== "running") return false;

    run.controller.abort();
    return true;
  };

  return {
    create(input, ctx, onProgress) {
      const id = randomUUID();
      const controller = new AbortController();
      const resolvedRole = resolveTaskRole(toTaskRoleInput(input));
      const progress = createTaskProgress(id, input.title, resolvedRole);
      const execute = () =>
        runTask(id, input, ctx, controller.signal, (next) => {
          const run = runsById.get(id);
          if (!run) return;

          run.progress = next;
          onProgress(next);
        });
      const result =
        resolvedRole.role === "implement" ? implementationQueue.run(execute) : Promise.resolve().then(execute);

      runsById.set(id, { controller, progress, result });
      onProgress(progress);

      void result.catch(() => {
        const run = runsById.get(id);
        if (!run) return;

        run.progress = {
          ...run.progress,
          currentTask: STOPPED_TASK_LABEL,
          status: "error",
        };
      });

      return { id, result };
    },
    status(id) {
      const run = runsById.get(id);
      if (!run) return { found: false };

      return { found: true, progress: run.progress };
    },
    list() {
      return [...runsById.values()].map((run) => run.progress);
    },
    cancel,
    cancelAll() {
      for (const id of runsById.keys()) {
        cancel(id);
      }
    },
    clear() {
      for (const id of runsById.keys()) {
        cancel(id);
      }
      runsById.clear();
    },
  };
}
