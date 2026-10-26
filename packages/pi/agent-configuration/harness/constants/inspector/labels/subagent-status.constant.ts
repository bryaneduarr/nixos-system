import type { ThemeColor } from "@earendil-works/pi-coding-agent";
import type { TaskStatus } from "../../../types/subagents/tasks/progress/task-status.interface.ts";
import { THEME_MUTED } from "../../split-view/theme-color.constant.ts";

/** Word and color that show the lifecycle state of a subagent. */
export const SUBAGENT_STATUS_TEXT: Readonly<
  Record<TaskStatus, { readonly label: string; readonly color: ThemeColor }>
> = {
  running: { label: "running", color: "warning" },
  success: { label: "done", color: "success" },
  error: { label: "failed", color: "error" },
  cancelled: { label: "cancelled", color: THEME_MUTED },
};
