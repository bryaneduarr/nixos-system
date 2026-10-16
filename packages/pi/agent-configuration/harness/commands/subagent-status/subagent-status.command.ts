import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { subagentRegistry } from "../../services/subagents/registry/shared-subagent-registry.service.ts";
import type { TaskProgress } from "../../types/subagents/tasks/task-progress.interface.ts";

function runsMatching(requestedId: string): TaskProgress[] {
  const lookup = subagentRegistry.status(requestedId);
  return lookup.found ? [lookup.progress] : [];
}

export function registerSubagentStatusCommand(pi: ExtensionAPI): void {
  pi.registerCommand("subagent-status", {
    description: "Show the status of active subagents",
    handler: async (args, ctx) => {
      const requestedId = args.trim();
      const runs = requestedId ? runsMatching(requestedId) : subagentRegistry.list();
      const status = runs.length
        ? runs.map((run) => `${run.id} · ${run.title} · ${run.status} · ${run.currentTask}`).join("\n")
        : "No matching subagents.";

      ctx.ui.notify(status, "info");
    },
  });
}
