import { CARD_CANCELLED_LABEL } from "../../../constants/subagents/card/card.constant.ts";
import { COMPLETED_TASK_LABEL } from "../../../constants/subagents/tasks/progress/progress.constant.ts";
import { FAILED_LABEL } from "../../../constants/tool-rendering/presentation/presentation-label.constant.ts";
import type { SubagentCardTheme } from "../../../types/subagents/card/subagent-card-theme.interface.ts";
import type { TaskStatus } from "../../../types/subagents/tasks/progress/task-status.interface.ts";

function finalStatusLabel(status: TaskStatus): string {
  if (status === "success") return COMPLETED_TASK_LABEL;
  if (status === "cancelled") return CARD_CANCELLED_LABEL;

  return FAILED_LABEL;
}

export function renderFinalStatusLine(theme: SubagentCardTheme, status: TaskStatus): string {
  return theme.fg(status === "success" ? "success" : "error", finalStatusLabel(status));
}
