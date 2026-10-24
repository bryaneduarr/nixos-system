import { wrapTextWithAnsi } from "@earendil-works/pi-tui";
import { TRANSCRIPT_PREVIEW_LINES } from "../../../constants/transcript/transcript-preview.constant.ts";

export function previewTextLines(text: string, availableWidth: number): string[] {
  const textLines = wrapTextWithAnsi(text.trim(), Math.max(1, availableWidth)).filter((line) => line.trim() !== "");
  const hiddenLineCount = textLines.length - TRANSCRIPT_PREVIEW_LINES;
  const shownLines = textLines.slice(0, TRANSCRIPT_PREVIEW_LINES);
  return hiddenLineCount > 0 ? [...shownLines, hiddenLinesLabel(hiddenLineCount)] : shownLines;
}

function hiddenLinesLabel(count: number): string {
  return `... ${count} more line${count === 1 ? "" : "s"}`;
}
