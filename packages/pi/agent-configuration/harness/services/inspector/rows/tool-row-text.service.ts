import { MESSAGE_ACTIVITY_NAME } from "../../../constants/activity/record/activity-entry.constant.ts";
import { NO_TEXT_LABEL } from "../../../constants/inspector/detail/label.constant.ts";
import { THEME_ACCENT, THEME_TEXT } from "../../../constants/split-view/theme-color.constant.ts";
import { TASK_TOOL_NAME } from "../../../constants/subagents/roles/roles.constant.ts";
import { ACTIVE_MARKER } from "../../../constants/text/glyph.constant.ts";
import type { ToolRowTextOptions } from "../../../types/inspector/lists/tool-row-text-options.interface.ts";
import { toolLabel } from "../../tool-rendering/labels/tool-label.service.ts";
import { readArgumentText } from "../detail/content/read-argument-text.service.ts";
import { statusGlyph } from "../labels/tool/status-glyph.service.ts";
import { toolTargetLabel } from "../labels/tool/tool-target-label.service.ts";
import { rowDisclosure } from "./row-disclosure.service.ts";
import { rowElapsedLabel } from "./row-elapsed-label.service.ts";
import { rowStartTimeLabel } from "./row-start-time-label.service.ts";
import { rowUsageLabel } from "./row-usage-label.service.ts";

export function toolRowText({ row, expandedTasks, isSelected, isLastChild, theme }: ToolRowTextOptions): string {
  const call = row.level === "sub" ? row.sub : row.entry;
  const target = toolTargetLabel(call.toolName, call.args, row.entry.text);

  if (call.toolName === MESSAGE_ACTIVITY_NAME) {
    const number = readArgumentText(call.args, "number");
    const heading = number.state === "present" ? `MESSAGE ${number.value}` : "MESSAGE ";
    return theme.fg(THEME_ACCENT, `${ACTIVE_MARKER}${heading}  ${target || NO_TEXT_LABEL}`);
  }

  const prefix = call.toolName === TASK_TOOL_NAME ? "SUBAGENT " : "";
  const startTime = rowStartTimeLabel(row, call);
  const label = `${prefix}${toolLabel(call.toolName)}${startTime}  ${rowElapsedLabel(row)}${rowUsageLabel(row, call.toolName)}  ${target}`;
  const disclosure = rowDisclosure(row, expandedTasks, isLastChild);
  return `${statusGlyph(call.status, theme)} ${disclosure}${theme.fg(isSelected ? THEME_ACCENT : THEME_TEXT, label)}`;
}
