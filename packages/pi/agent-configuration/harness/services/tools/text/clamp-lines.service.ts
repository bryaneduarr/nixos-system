import type { ClampedText } from "../../../types/tools/text/clamped-text.interface.ts";
import { splitLines } from "./split-lines.service.ts";

export function clampLines(text: string, maxLines: number, maxChars: number): ClampedText {
  const lines = splitLines(text);
  const kept = lines.slice(0, maxLines);
  let clampedText = kept.join("\n");
  let truncated = lines.length > maxLines;
  if (clampedText.length > maxChars) {
    clampedText = clampedText.slice(0, maxChars);
    truncated = true;
  }
  return {
    text: clampedText,
    omittedLines: Math.max(0, lines.length - maxLines),
    truncated,
  };
}
