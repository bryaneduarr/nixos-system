import { BLANK_DETAIL_LINE } from "../../../../constants/inspector/detail/detail-line.constant.ts";
import { TASK_TOOL_NAME } from "../../../../constants/subagents/roles/roles.constant.ts";
import type { DetailLine } from "../../../../types/inspector/detail/detail-line.interface.ts";
import type { DetailOptions } from "../../../../types/inspector/detail/detail-options.interface.ts";
import { isPseudoEntryTool } from "../../entries/is-pseudo-entry-tool.service.ts";
import { readEndedAt } from "../../entries/read-ended-at.service.ts";
import { formatInput } from "../content/format-input.service.ts";
import { formatOutput } from "../content/format-output.service.ts";
import { artifactNoticeLines } from "./artifact-notice-lines.service.ts";
import { boxedDetailLines } from "./boxed-detail-lines.service.ts";
import { detailColor } from "./detail-color.service.ts";
import { detailHeading } from "./detail-heading.service.ts";
import { detailTargetLines } from "./detail-target-lines.service.ts";
import { detailTimingLabel } from "./detail-timing-label.service.ts";
import { pseudoEntryLines } from "./pseudo-entry-lines.service.ts";
import { taskSummaryLines } from "./task-summary-lines.service.ts";

export function buildDetail({ row, width, artifact }: DetailOptions): DetailLine[] {
  const entry = row.entry;
  const isChildCall = row.level === "sub";
  const call = row.level === "sub" ? row.sub : entry;
  const tool = call.toolName;
  const args = call.args;
  const startedAt = call.startedAt;
  const rawText = artifact.kind === "loaded" ? artifact.text : call.text;
  const color = detailColor(tool);
  const timing = detailTimingLabel(startedAt, readEndedAt(row));
  const lines: DetailLine[] = [
    detailHeading({ tool, args, status: call.status, startedAt }),
    ...detailTargetLines({ tool, args, isChildCall, color }),
    BLANK_DETAIL_LINE,
  ];

  if (isPseudoEntryTool(tool)) {
    return [...lines, ...pseudoEntryLines({ tool, entry, startedAt, timing, rawText, width })];
  }

  if (!isChildCall && tool === TASK_TOOL_NAME) lines.push(...taskSummaryLines(entry));

  lines.push({ text: `INPUT  ${timing}`, color, bold: true });
  lines.push(BLANK_DETAIL_LINE);
  lines.push(...boxedDetailLines({ title: "input", text: formatInput(tool, args), color, width }));
  lines.push(BLANK_DETAIL_LINE);
  lines.push(...artifactNoticeLines(entry, artifact));

  const outputTitle = artifact.kind === "loaded" ? "ARTIFACT" : "OUTPUT";
  const outputBoxTitle = artifact.kind === "loaded" ? "json" : "result";
  lines.push({ text: outputTitle, color, bold: true });
  lines.push(BLANK_DETAIL_LINE);
  lines.push(...boxedDetailLines({ title: outputBoxTitle, text: formatOutput(rawText), color, width }));
  return lines;
}
