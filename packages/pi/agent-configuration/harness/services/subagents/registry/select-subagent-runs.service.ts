import type { SubagentRegistry } from "../../../types/subagents/registry/subagent-registry.interface.ts";
import type { TaskProgress } from "../../../types/subagents/tasks/progress/task-progress.interface.ts";

export function selectSubagentRuns(registry: SubagentRegistry, requestedId: string): readonly TaskProgress[] {
  if (requestedId === "") return registry.list();

  const lookup = registry.status(requestedId);
  return lookup.found ? [lookup.progress] : [];
}
