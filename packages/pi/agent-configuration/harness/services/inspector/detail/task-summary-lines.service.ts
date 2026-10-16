import { BLANK_DETAIL_LINE } from "../../../constants/inspector/detail-line.constant.ts";
import { EMPTY_VALUE_LABEL } from "../../../constants/inspector/label.constant.ts";
import type { ToolActivity } from "../../../types/activity/tool-activity.interface.ts";
import type { DetailLine } from "../../../types/inspector/detail/detail-line.interface.ts";
import { presentValue } from "../../activity/value/present-value.service.ts";
import { formatTokens } from "../labels/format-tokens.service.ts";
import { modelLabel } from "../labels/model-label.service.ts";

export function taskSummaryLines(entry: ToolActivity): DetailLine[] {
  const currentTokens =
    entry.usage.usageState === "reported" ? presentValue(entry.usage.usage.contextTokens) : undefined;
  const currentContext = currentTokens === undefined ? EMPTY_VALUE_LABEL : formatTokens(currentTokens);
  const subagentModel = presentValue(entry.model);
  const modelWindow = subagentModel === undefined ? undefined : presentValue(subagentModel.contextWindow);
  const contextWindow = modelWindow ? formatTokens(modelWindow) : EMPTY_VALUE_LABEL;
  const reasoning = presentValue(entry.thinkingLevel) ?? EMPTY_VALUE_LABEL;
  const callCount = entry.sub.length;

  return [
    { text: `MODEL ${modelLabel(entry.model)}`, color: "accent", bold: true },
    { text: `REASONING ${reasoning}`, color: "accent", bold: false },
    { text: `CONTEXT ${currentContext}/${contextWindow} | ${callCount} calls`, color: "accent", bold: true },
    BLANK_DETAIL_LINE,
  ];
}
