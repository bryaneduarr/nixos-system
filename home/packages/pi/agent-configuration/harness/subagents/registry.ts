import { randomUUID } from "node:crypto";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { runTask, type TaskInput, type TaskProgress, type TaskResult } from "./runner.ts";
import { ImplementationQueue } from "./implementation-queue.ts";
import { resolveTaskRole } from "./roles.ts";

export interface SubagentHandle {
  id: string;
  result: Promise<TaskResult>;
}

interface SubagentRun {
  controller: AbortController;
  progress: TaskProgress;
  result: Promise<TaskResult>;
}

export class SubagentRegistry {
  private implementationQueue = new ImplementationQueue();
  private runs = new Map<string, SubagentRun>();

  create(
    input: TaskInput,
    ctx: ExtensionContext,
    onProgress: (progress: TaskProgress) => void,
  ): SubagentHandle {
    const id = randomUUID();
    const controller = new AbortController();
    const resolvedRole = resolveTaskRole(input);
    const progress: TaskProgress = {
      id,
      title: input.title,
      role: resolvedRole.role,
      tools: [...resolvedRole.tools],
      verificationCommands: [...resolvedRole.verificationCommands],
      currentTask: "Starting",
      status: "running",
      activity: [],
    };
    const execute = () => runTask(
      id,
      input,
      ctx,
      controller.signal,
      (next) => {
        const run = this.runs.get(id);
        if (!run) return;

        run.progress = next;
        onProgress(next);
      },
    );
    const result = resolvedRole.role === "implement"
      ? this.implementationQueue.run(execute)
      : Promise.resolve().then(execute);

    this.runs.set(id, { controller, progress, result });
    onProgress(progress);

    void result.catch(() => {
      const run = this.runs.get(id);
      if (!run) return;

      run.progress = {
        ...run.progress,
        currentTask: "Stopped",
        status: "error",
      };
    });

    return { id, result };
  }

  status(id: string): TaskProgress | undefined {
    return this.runs.get(id)?.progress;
  }

  list(): TaskProgress[] {
    return [...this.runs.values()].map((run) => run.progress);
  }

  cancel(id: string): boolean {
    const run = this.runs.get(id);
    if (!run || run.progress.status !== "running") return false;

    run.controller.abort();
    return true;
  }

  cancelAll(): void {
    for (const id of this.runs.keys()) {
      this.cancel(id);
    }
  }

  clear(): void {
    this.cancelAll();
    this.runs.clear();
  }
}

export const subagentRegistry = new SubagentRegistry();
