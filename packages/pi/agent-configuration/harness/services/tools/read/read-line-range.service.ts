import { MAX_READ_CHARS } from "../../../constants/tools/read/read-limits.constant.ts";
import type { LoadedFile } from "../../../types/tools/read/loaded-file.interface.ts";
import { takeLinesWithinBudget } from "../text/take-lines-within-budget.service.ts";
import { withLineNumbers } from "../text/with-line-numbers.service.ts";

export function readLineRange(file: LoadedFile, startLine: number, lineCount: number): string {
  const total = file.lines.length;
  const startIndex = Math.min(startLine - 1, total);
  const requestedEndIndex = Math.min(total, startIndex + lineCount);
  const selectedLines = takeLinesWithinBudget(file.lines.slice(startIndex, requestedEndIndex), MAX_READ_CHARS);
  const endIndex = startIndex + selectedLines.length;
  const remaining = total - endIndex;
  const note = remaining > 0 ? `\n\n[${remaining} more lines. Use read with offset=${endIndex + 1} to continue.]` : "";
  return [
    `${file.displayPath} (lines ${startIndex + 1}-${endIndex} of ${total})`,
    withLineNumbers(selectedLines, startIndex + 1) + note,
  ].join("\n\n");
}
