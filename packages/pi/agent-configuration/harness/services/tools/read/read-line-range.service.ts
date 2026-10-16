import type { LoadedFile } from "../../../types/tools/read/loaded-file.interface.ts";
import { withLineNumbers } from "../text/with-line-numbers.service.ts";

export function readLineRange(file: LoadedFile, startLine: number, lineCount: number): string {
  const total = file.lines.length;
  const startIndex = Math.min(startLine - 1, total);
  const endIndex = Math.min(total, startIndex + lineCount);
  const slice = file.lines.slice(startIndex, endIndex);
  const remaining = total - endIndex;
  const note = remaining > 0 ? `\n\n[${remaining} more lines. Use read with offset=${endIndex + 1} to continue.]` : "";
  return [
    `${file.displayPath} (lines ${startIndex + 1}-${endIndex} of ${total})`,
    withLineNumbers(slice, startIndex + 1) + note,
  ].join("\n\n");
}
