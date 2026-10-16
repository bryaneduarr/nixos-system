import { readFile, stat } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import {
  DEFAULT_READ_LINES,
  LARGE_FILE_BYTES,
  LARGE_FILE_LINES,
  STRUCTURE_SYMBOL_LIMIT,
} from "../constants/tools/read-limits.constant.ts";
import type { ReadParameters } from "../types/tools/read/read-parameters.interface.ts";
import type { ReadRequest, ReadSelection } from "../types/tools/read/read-request.interface.ts";
import type { SymbolRangeLookup } from "../types/tools/read/symbol-range-lookup.interface.ts";
import { splitLines, stripAtPrefix, withLineNumbers } from "./format.ts";

const SYMBOL_PATTERN =
  /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function|class|interface|type|enum|const|let|var|def|func|fn|struct|trait|impl)\s+([A-Za-z_$][A-Za-z0-9_$]*)/;
const METHOD_PATTERN =
  /^\s*(?:public|private|protected|static|async|get|set|readonly|override|\s)*([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/;

export function toReadSelection(params: ReadParameters): ReadSelection {
  if (params.symbol !== undefined && params.symbol.trim() !== "") {
    return { kind: "symbol", symbol: params.symbol };
  }
  if (params.offset === undefined && params.limit === undefined) {
    return { kind: "automatic" };
  }
  return {
    kind: "lines",
    startLine: Math.max(1, params.offset ?? 1),
    lineCount: Math.max(1, params.limit ?? DEFAULT_READ_LINES),
  };
}

function declarationPattern(symbol: string): RegExp {
  const name = symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `^\\s*(?:export\\s+)?(?:default\\s+)?(?:async\\s+)?(?:function|class|interface|type|enum|const|let|var|def|func|fn|struct|trait|impl)\\s+${name}\\b|^\\s*(?:public|private|protected|static|async|get|set|readonly|override|\\s)*${name}\\s*\\(`,
  );
}

function findSymbolRange(lines: string[], symbol: string): SymbolRangeLookup {
  const pattern = declarationPattern(symbol);
  const start = lines.findIndex((line) => pattern.test(line));
  if (start === -1) return { found: false };

  let depth = 0;
  let seenBrace = false;
  for (let index = start; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    for (const character of line) {
      if (character === "{") {
        depth += 1;
        seenBrace = true;
      } else if (character === "}") {
        depth -= 1;
      }
    }
    if (seenBrace && depth <= 0) {
      return { found: true, start, end: index };
    }
    if (!seenBrace && index - start >= 40) {
      return { found: true, start, end: index };
    }
  }
  return { found: true, start, end: Math.min(lines.length - 1, start + 120) };
}

function listSymbols(lines: string[]): string[] {
  const symbols: string[] = [];
  for (const [index, line] of lines.entries()) {
    const match = SYMBOL_PATTERN.exec(line);
    if (match) {
      symbols.push(`${index + 1}: ${match[1]}`);
      if (symbols.length >= STRUCTURE_SYMBOL_LIMIT) break;
      continue;
    }
    if (/^\s{2,}/.test(line)) {
      const method = METHOD_PATTERN.exec(line);
      if (method) {
        symbols.push(`${index + 1}: ${method[1]}()`);
        if (symbols.length >= STRUCTURE_SYMBOL_LIMIT) break;
      }
    }
  }
  return symbols;
}

export async function readSource(request: ReadRequest): Promise<string> {
  const { cwd, selection } = request;
  const rawPath = stripAtPrefix(request.path);
  const absolutePath = isAbsolute(rawPath) ? rawPath : resolve(cwd, rawPath);

  let content: string;
  try {
    content = await readFile(absolutePath, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `Unable to read ${rawPath}: ${message}`;
  }

  const lines = splitLines(content);
  if (lines.length > 0 && lines[lines.length - 1] === "" && content.endsWith("\n")) {
    lines.pop();
  }
  const total = lines.length;

  if (selection.kind === "symbol") {
    const range = findSymbolRange(lines, selection.symbol.trim());
    if (!range.found) {
      return `Symbol "${selection.symbol}" not found in ${rawPath}.`;
    }
    const slice = lines.slice(range.start, range.end + 1);
    return [
      `${rawPath} (lines ${range.start + 1}-${range.end + 1} of ${total})`,
      withLineNumbers(slice, range.start + 1),
    ].join("\n\n");
  }

  if (selection.kind === "lines") {
    const startIndex = Math.min(selection.startLine - 1, total);
    const endIndex = Math.min(total, startIndex + selection.lineCount);
    const slice = lines.slice(startIndex, endIndex);
    const remaining = total - endIndex;
    const note =
      remaining > 0 ? `\n\n[${remaining} more lines. Use read with offset=${endIndex + 1} to continue.]` : "";
    return [
      `${rawPath} (lines ${startIndex + 1}-${endIndex} of ${total})`,
      withLineNumbers(slice, startIndex + 1) + note,
    ].join("\n\n");
  }

  let size = 0;
  try {
    size = (await stat(absolutePath)).size;
  } catch {
    size = content.length;
  }

  if (total <= LARGE_FILE_LINES && size <= LARGE_FILE_BYTES) {
    return [`${rawPath} (${total} lines)`, withLineNumbers(lines, 1)].join("\n\n");
  }

  const symbols = listSymbols(lines);
  const head = lines.slice(0, 30);
  const symbolSection = symbols.length > 0 ? `Symbols:\n${symbols.join("\n")}` : "Symbols:\nnone detected";
  return [
    `${rawPath} (${total} lines, ${size} bytes) - large file, showing structure only`,
    symbolSection,
    `Head:\n${withLineNumbers(head, 1)}`,
    `[Use read with offset/limit or symbol=<name> to view a specific section.]`,
  ].join("\n\n");
}
