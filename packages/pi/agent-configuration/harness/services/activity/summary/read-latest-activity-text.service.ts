import { UPDATE_ACTIVITY_NAME } from "../../../constants/activity/record/activity-entry.constant.ts";
import { COMPLETED_LABEL, WORKING_LABEL } from "../../../constants/activity/summary/summary-label.constant.ts";
import type { ToolActivity } from "../../../types/activity/store/tool-activity.interface.ts";
import { harnessToolTarget } from "../../tool-rendering/labels/harness-tool-target.service.ts";
import { toolLabel } from "../../tool-rendering/labels/tool-label.service.ts";
import { oneLine } from "../../tool-rendering/text/one-line.service.ts";
import { isHarnessTool } from "../../tools/active-tools/is-harness-tool.service.ts";
import { readThinkingTitles } from "./read-thinking-titles.service.ts";

export function readLatestActivityText(
  messageNumber: number,
  entries: readonly ToolActivity[],
  working: boolean,
): string {
  if (!working) return COMPLETED_LABEL;
  const candidates = [
    ...readThinkingTitles(messageNumber).slice(-1),
    ...readLatestUpdateText(entries),
    ...readLatestToolTitle(entries),
  ];
  const latest = candidates.find((text) => text !== "");
  return latest === undefined ? WORKING_LABEL : latest;
}

function readLatestUpdateText(entries: readonly ToolActivity[]): readonly string[] {
  return entries
    .filter((entry) => entry.toolName === UPDATE_ACTIVITY_NAME)
    .slice(-1)
    .map((entry) => oneLine(entry.text));
}

function readLatestToolTitle(entries: readonly ToolActivity[]): readonly string[] {
  for (const entry of entries.toReversed()) {
    if (isHarnessTool(entry.toolName))
      return [`${toolLabel(entry.toolName)} ${harnessToolTarget(entry.toolName, entry.args)}`];
  }
  return [];
}
