import type { ClampedText } from "../../../types/tools/text/clamped-text.interface.ts";
import { splitLines } from "./split-lines.service.ts";

export function clampLines(text: string, maxLines: number, maxChars: number): ClampedText {
  const lines = splitLines(text);
  const kept = lines.slice(0, maxLines);
  let out = kept.join("\n");
  let truncated = lines.length > maxLines;
  if (out.length > maxChars) {
    out = out.slice(0, maxChars);
    truncated = true;
  }
  return {
    text: out,
    omittedLines: Math.max(0, lines.length - maxLines),
    truncated,
  };
}
