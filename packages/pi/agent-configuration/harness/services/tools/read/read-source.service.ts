import { readFile } from "node:fs/promises";
import type { LoadedFile } from "../../../types/tools/read/loaded-file.interface.ts";
import type { ReadRequest } from "../../../types/tools/read/read-request.interface.ts";
import { resolveToolPath } from "../path/resolve-tool-path.service.ts";
import { stripAtPrefix } from "../path/strip-at-prefix.service.ts";
import { splitLines } from "../text/split-lines.service.ts";
import { readAutomaticSelection } from "./read-automatic-selection.service.ts";
import { readLineRange } from "./read-line-range.service.ts";
import { readSymbolSection } from "./read-symbol-section.service.ts";

function toLoadedFile(displayPath: string, absolutePath: string, content: string): LoadedFile {
  const lines = splitLines(content);
  return {
    displayPath,
    absolutePath,
    content,
    lines: content.endsWith("\n") ? lines.slice(0, -1) : lines,
  };
}

export async function readSource(request: ReadRequest): Promise<string> {
  const displayPath = stripAtPrefix(request.path);
  const absolutePath = resolveToolPath(request.cwd, request.path);

  let content: string;
  try {
    content = await readFile(absolutePath, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `Unable to read ${displayPath}: ${message}`;
  }

  const file = toLoadedFile(displayPath, absolutePath, content);
  const { selection } = request;
  if (selection.kind === "symbol") return readSymbolSection(file, selection.symbol);
  if (selection.kind === "lines") return readLineRange(file, selection.startLine, selection.lineCount);
  return readAutomaticSelection(file);
}
