import { UPDATE_ACTIVITY_NAME } from "../../../constants/activity/activity-entry.constant.ts";
import { COMPLETED_LABEL, WORKING_LABEL } from "../../../constants/activity/summary-label.constant.ts";
import type { ToolActivity } from "../../../types/activity/tool-activity.interface.ts";
import { toolLabel } from "../../tool-rendering/presentation/tool-label.service.ts";
import { toolTarget } from "../../tool-rendering/presentation/tool-target.service.ts";
import { oneLine } from "../../tool-rendering/text/one-line.service.ts";
import { isHarnessTool } from "../../tools/is-harness-tool.service.ts";
import { readThinkingTitles } from "./thinking-titles.service.ts";

export function readLatestActivityText(
  messageNumber: number,
  entries: readonly ToolActivity[],
  working: boolean,
): string {
  const latest =
    readThinkingTitles(messageNumber).at(-1) || readLatestUpdateText(entries) || readLatestToolTitle(entries);
  return latest || (working ? WORKING_LABEL : COMPLETED_LABEL);
}

function readLatestUpdateText(entries: readonly ToolActivity[]): string {
  const lastUpdate = entries.filter((entry) => entry.toolName === UPDATE_ACTIVITY_NAME).at(-1);
  return lastUpdate === undefined ? "" : oneLine(lastUpdate.text);
}

function readLatestToolTitle(entries: readonly ToolActivity[]): string {
  const lastTool = entries.filter((entry) => isHarnessTool(entry.toolName)).at(-1);
  if (lastTool === undefined || !isHarnessTool(lastTool.toolName)) return "";
  return `${toolLabel(lastTool.toolName)} ${toolTarget(lastTool.toolName, lastTool.args)}`;
}
