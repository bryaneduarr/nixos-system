import type { ThemeColor } from "@earendil-works/pi-coding-agent";
import type { ActivityStatus } from "../../../../types/activity/store/activity-status.interface.ts";

export function statusColor(status: ActivityStatus): ThemeColor {
  switch (status) {
    case "running":
      return "warning";
    case "error":
      return "error";
    case "success":
      return "success";
    default:
      return status satisfies never;
  }
}
