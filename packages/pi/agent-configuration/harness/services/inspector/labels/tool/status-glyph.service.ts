import type { Theme } from "@earendil-works/pi-coding-agent";
import type { ActivityStatus } from "../../../../types/activity/store/activity-status.interface.ts";

export function statusGlyph(status: ActivityStatus, theme: Pick<Theme, "fg">): string {
  switch (status) {
    case "running":
      return theme.fg("warning", "●");
    case "error":
      return theme.fg("error", "✗");
    case "success":
      return theme.fg("success", "✓");
    default:
      return status satisfies never;
  }
}
