import { CARD_CANCELLED_LABEL, CARD_FAILED_LABEL } from "../../../constants/subagents/card.constant.ts";
import { COMPLETED_TASK_LABEL } from "../../../constants/subagents/progress.constant.ts";
import type { SubagentCardTheme } from "../../../types/subagents/card/subagent-card-theme.interface.ts";
import type { TaskStatus } from "../../../types/subagents/tasks/progress/task-status.interface.ts";

function finalStatusLabel(status: TaskStatus): string {
  if (status === "success") return COMPLETED_TASK_LABEL;
  if (status === "cancelled") return CARD_CANCELLED_LABEL;

  return CARD_FAILED_LABEL;
}

export function renderFinalStatusLine(theme: SubagentCardTheme, status: TaskStatus): string {
  return theme.fg(status === "success" ? "success" : "error", finalStatusLabel(status));
}
