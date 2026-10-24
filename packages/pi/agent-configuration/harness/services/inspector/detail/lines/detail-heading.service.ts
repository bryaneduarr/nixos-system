import { MESSAGE_ACTIVITY_NAME } from "../../../../constants/activity/record/activity-entry.constant.ts";
import { USER_MESSAGE_HEADING } from "../../../../constants/inspector/detail/heading.constant.ts";
import { THEME_ACCENT } from "../../../../constants/split-view/theme-color.constant.ts";
import type { DetailHeadingOptions } from "../../../../types/inspector/detail/detail-heading-options.interface.ts";
import type { DetailLine } from "../../../../types/inspector/detail/detail-line.interface.ts";
import { toolLabel } from "../../../tool-rendering/labels/tool-label.service.ts";
import { formatTime } from "../../format/format-time.service.ts";
import { statusColor } from "../../labels/tool/status-color.service.ts";
import { readArgumentText } from "../content/read-argument-text.service.ts";

export function detailHeading({ tool, args, status, startedAt }: DetailHeadingOptions): DetailLine {
  if (tool === MESSAGE_ACTIVITY_NAME) {
    const number = readArgumentText(args, "number");
    const heading = number.state === "present" ? `${USER_MESSAGE_HEADING}${number.value}` : USER_MESSAGE_HEADING;
    return { text: `${heading}  ${formatTime(startedAt)}`, color: THEME_ACCENT, bold: true };
  }
  const text = `${toolLabel(tool)}  ${status.toUpperCase()}  ${formatTime(startedAt)}`;
  return { text, color: statusColor(status), bold: true };
}
