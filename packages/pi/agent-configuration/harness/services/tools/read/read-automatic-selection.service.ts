import { stat } from "node:fs/promises";
import {
  LARGE_FILE_BYTES,
  LARGE_FILE_LINES,
  STRUCTURE_HEAD_LINES,
} from "../../../constants/tools/read/read-limits.constant.ts";
import type { LoadedFile } from "../../../types/tools/read/loaded-file.interface.ts";
import { withLineNumbers } from "../text/with-line-numbers.service.ts";
import { listSymbols } from "./list-symbols.service.ts";
import { outlineFile } from "./outline-file.service.ts";

async function readFileSize(file: LoadedFile): Promise<number> {
  try {
    return (await stat(file.absolutePath)).size;
  } catch {
    return file.content.length;
  }
}

async function structureSection(file: LoadedFile): Promise<string> {
  const outline = await outlineFile(file.absolutePath);
  if (outline.found) return `Outline (ast-grep):\n${outline.text}`;

  const symbols = listSymbols(file.lines);
  return symbols.length > 0 ? `Symbols:\n${symbols.join("\n")}` : "Symbols:\nnone detected";
}

export async function readAutomaticSelection(file: LoadedFile): Promise<string> {
  const total = file.lines.length;
  const size = await readFileSize(file);
  const isSmallFile = total <= LARGE_FILE_LINES && size <= LARGE_FILE_BYTES;
  if (isSmallFile) {
    return [`${file.displayPath} (${total} lines)`, withLineNumbers(file.lines, 1)].join("\n\n");
  }

  const head = file.lines.slice(0, STRUCTURE_HEAD_LINES);
  return [
    `${file.displayPath} (${total} lines, ${size} bytes) - large file, showing structure only`,
    await structureSection(file),
    `Head:\n${withLineNumbers(head, 1)}`,
    `[Use read with offset/limit or symbol=<name> to view a specific section.]`,
  ].join("\n\n");
}
