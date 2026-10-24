import type { LoadedFile } from "../../../types/tools/read/loaded-file.interface.ts";
import { findSymbolRange } from "./find-symbol-range.service.ts";
import { readLineRange } from "./read-line-range.service.ts";

export function readSymbolSection(file: LoadedFile, symbol: string): string {
  const range = findSymbolRange(file.lines, symbol.trim());
  if (!range.found) {
    return `Symbol "${symbol}" not found in ${file.displayPath}.`;
  }
  return readLineRange(file, range.start + 1, range.end - range.start + 1);
}
