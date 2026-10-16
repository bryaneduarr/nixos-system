import type { LoadedFile } from "../../../types/tools/read/loaded-file.interface.ts";
import { withLineNumbers } from "../text/with-line-numbers.service.ts";
import { findSymbolRange } from "./find-symbol-range.service.ts";

export function readSymbolSection(file: LoadedFile, symbol: string): string {
  const range = findSymbolRange(file.lines, symbol.trim());
  if (!range.found) {
    return `Symbol "${symbol}" not found in ${file.displayPath}.`;
  }
  const slice = file.lines.slice(range.start, range.end + 1);
  return [
    `${file.displayPath} (lines ${range.start + 1}-${range.end + 1} of ${file.lines.length})`,
    withLineNumbers(slice, range.start + 1),
  ].join("\n\n");
}
