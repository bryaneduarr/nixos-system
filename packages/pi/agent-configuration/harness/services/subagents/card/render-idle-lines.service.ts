import { THEME_MUTED } from "../../../constants/split-view/theme-color.constant.ts";
import { CARD_NO_TOOL_CALLS_LABEL } from "../../../constants/subagents/card/card.constant.ts";
import { STARTING_TASK_LABEL } from "../../../constants/subagents/tasks/progress/progress.constant.ts";
import type { SubagentCardTheme } from "../../../types/subagents/card/subagent-card-theme.interface.ts";
import type { TaskStatus } from "../../../types/subagents/tasks/progress/task-status.interface.ts";

export function renderIdleLines(theme: SubagentCardTheme, status: TaskStatus): string[] {
  const startLabel = status === "running" ? STARTING_TASK_LABEL : CARD_NO_TOOL_CALLS_LABEL;
  return [theme.fg(THEME_MUTED, startLabel)];
}
