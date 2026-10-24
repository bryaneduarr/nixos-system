import { NO_MATCHING_SUBAGENTS_MESSAGE } from "../../../constants/subagents/registry/subagent-command.constant.ts";
import { DOT_SEPARATOR } from "../../../constants/text/separator.constant.ts";
import type { TaskProgress } from "../../../types/subagents/tasks/progress/task-progress.interface.ts";

export function formatSubagentRuns(runs: readonly TaskProgress[]): string {
  if (runs.length === 0) return NO_MATCHING_SUBAGENTS_MESSAGE;

  return runs.map((run) => [run.id, run.title, run.status, run.currentTask].join(DOT_SEPARATOR)).join("\n");
}
