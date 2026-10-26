import { truncateToWidth, visibleWidth, wrapTextWithAnsi } from "@earendil-works/pi-tui";
import {
  MARKDOWN_SYNTAX_PATTERN,
  MIN_FENCE_LENGTH,
  PREVIEW_LINES,
  PREVIEW_RESERVED_COLUMNS,
  PREVIEW_SOURCE_LIMIT,
} from "../../../constants/prompts/preview.constant.ts";
import { NEWLINE_CHARACTER } from "../../../constants/prompts/text.constant.ts";
import { ELLIPSIS } from "../../../constants/text/ellipsis.constant.ts";

export function previewPrompt(text: string, width: number): string {
  const contentWidth = Math.max(1, width - PREVIEW_RESERVED_COLUMNS);
  const prefix = text.slice(0, PREVIEW_SOURCE_LIMIT);
  const lines = wrapTextWithAnsi(prefix, contentWidth);
  const isTruncated = prefix.length < text.length || lines.length > PREVIEW_LINES;

  if (!isTruncated) return text;

  const shownLines = lines.slice(0, PREVIEW_LINES);
  const lastLine = shownLines.at(-1);
  if (lastLine === undefined) return text;
  const markerWidth = visibleWidth(ELLIPSIS);
  const truncatedLastLine = `${truncateToWidth(lastLine, Math.max(0, contentWidth - markerWidth), "")}${ELLIPSIS}`;

  return showAsTyped([...shownLines.slice(0, -1), truncatedLastLine]);
}

function showAsTyped(lines: readonly string[]): string {
  const text = lines.join(NEWLINE_CHARACTER);
  if (!lines.some((line) => MARKDOWN_SYNTAX_PATTERN.test(line))) return text;

  const backtickRuns = text.match(/`+/g) ?? [];
  const fenceLength = Math.max(MIN_FENCE_LENGTH, ...backtickRuns.map((run) => run.length + 1));
  const fence = "`".repeat(fenceLength);
  return [fence, text, fence].join(NEWLINE_CHARACTER);
}
