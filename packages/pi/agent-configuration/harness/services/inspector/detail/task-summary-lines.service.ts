import { BLANK_DETAIL_LINE } from "../../../constants/inspector/detail-line.constant.ts";
import { EMPTY_VALUE_LABEL } from "../../../constants/inspector/label.constant.ts";
import type { ToolActivity } from "../../../types/activity/tool-activity.interface.ts";
import type { ToolActivityUsage } from "../../../types/activity/tool-activity-usage.interface.ts";
import type { DetailLine } from "../../../types/inspector/detail/detail-line.interface.ts";
import { contextWindowLabel } from "../labels/context-window-label.service.ts";
import { formatTokens } from "../labels/format-tokens.service.ts";
import { modelLabel } from "../labels/model-label.service.ts";

function currentContextLabel(usage: ToolActivityUsage): string {
  if (usage.usageState === "unreported" || usage.usage.contextTokens.state === "absent") return EMPTY_VALUE_LABEL;
  return formatTokens(usage.usage.contextTokens.value);
}

export function taskSummaryLines(entry: ToolActivity): DetailLine[] {
  const currentContext = currentContextLabel(entry.usage);
  const contextWindow = contextWindowLabel(entry.model);
  const reasoning = entry.thinkingLevel.state === "present" ? entry.thinkingLevel.value : EMPTY_VALUE_LABEL;
  const callCount = entry.sub.length;

  return [
    { text: `MODEL ${modelLabel(entry.model)}`, color: "accent", bold: true },
    { text: `REASONING ${reasoning}`, color: "accent", bold: false },
    { text: `CONTEXT ${currentContext}/${contextWindow} | ${callCount} calls`, color: "accent", bold: true },
    BLANK_DETAIL_LINE,
  ];
}
