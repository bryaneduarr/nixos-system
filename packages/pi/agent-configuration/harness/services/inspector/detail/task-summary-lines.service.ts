import { BLANK_DETAIL_LINE } from "../../../constants/inspector/detail-line.constant.ts";
import type { ToolActivity } from "../../../types/activity/tool-activity.interface.ts";
import type { DetailLine } from "../../../types/inspector/detail/detail-line.interface.ts";
import { presentValue } from "../../activity/value/present-value.service.ts";
import { formatTokens } from "../labels/format-tokens.service.ts";
import { modelLabel } from "../labels/model-label.service.ts";
import { reportedUsageOf } from "../labels/reported-usage-of.service.ts";

export function taskSummaryLines(entry: ToolActivity): DetailLine[] {
  const usage = reportedUsageOf(entry.usage);
  const model = presentValue(entry.model);
  const modelWindow = model === undefined ? undefined : presentValue(model.contextWindow);
  const reasoning = presentValue(entry.thinkingLevel) ?? "—";
  const currentTokens = usage === undefined ? undefined : presentValue(usage.contextTokens);
  const currentContext = currentTokens === undefined ? "—" : formatTokens(currentTokens);
  const contextWindow = modelWindow ? formatTokens(modelWindow) : "—";
  const callCount = entry.sub.length;

  return [
    { text: `MODEL ${modelLabel(model)}`, color: "accent", bold: true },
    { text: `REASONING ${reasoning}`, color: "accent", bold: false },
    { text: `CONTEXT ${currentContext}/${contextWindow} | ${callCount} calls`, color: "accent", bold: true },
    BLANK_DETAIL_LINE,
  ];
}
