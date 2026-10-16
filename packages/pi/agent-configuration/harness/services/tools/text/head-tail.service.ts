import type { HeadTailText } from "../../../types/tools/text/head-tail-text.interface.ts";
import { splitLines } from "./split-lines.service.ts";

export function headTail(text: string, head: number, tail: number): HeadTailText {
  const lines = splitLines(text);
  if (lines.length <= head + tail) {
    return { text: lines.join("\n"), omittedLines: 0 };
  }
  const omitted = lines.length - head - tail;
  return {
    text: [...lines.slice(0, head), `... ${omitted} lines omitted ...`, ...lines.slice(-tail)].join("\n"),
    omittedLines: omitted,
  };
}
