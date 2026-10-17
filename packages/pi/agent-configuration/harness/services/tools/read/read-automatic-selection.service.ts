import { stat } from "node:fs/promises";
import {
  LARGE_FILE_BYTES,
  LARGE_FILE_LINES,
  STRUCTURE_HEAD_LINES,
} from "../../../constants/tools/read-limits.constant.ts";
import type { LoadedFile } from "../../../types/tools/read/loaded-file.interface.ts";
import { withLineNumbers } from "../text/with-line-numbers.service.ts";
import { listSymbols } from "./list-symbols.service.ts";

async function readFileSize(file: LoadedFile): Promise<number> {
  try {
    return (await stat(file.absolutePath)).size;
  } catch {
    return file.content.length;
  }
}

export async function readAutomaticSelection(file: LoadedFile): Promise<string> {
  const total = file.lines.length;
  const size = await readFileSize(file);
  const isSmallFile = total <= LARGE_FILE_LINES && size <= LARGE_FILE_BYTES;
  if (isSmallFile) {
    return [`${file.displayPath} (${total} lines)`, withLineNumbers(file.lines, 1)].join("\n\n");
  }

  const symbols = listSymbols(file.lines);
  const head = file.lines.slice(0, STRUCTURE_HEAD_LINES);
  const symbolSection = symbols.length > 0 ? `Symbols:\n${symbols.join("\n")}` : "Symbols:\nnone detected";
  return [
    `${file.displayPath} (${total} lines, ${size} bytes) - large file, showing structure only`,
    symbolSection,
    `Head:\n${withLineNumbers(head, 1)}`,
    `[Use read with offset/limit or symbol=<name> to view a specific section.]`,
  ].join("\n\n");
}
