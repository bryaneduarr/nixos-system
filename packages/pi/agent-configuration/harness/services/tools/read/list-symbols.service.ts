import { STRUCTURE_SYMBOL_LIMIT } from "../../../constants/tools/read/read-limits.constant.ts";
import {
  INDENTED_LINE_PATTERN,
  METHOD_DECLARATION_PATTERN,
  SYMBOL_DECLARATION_PATTERN,
} from "../../../constants/tools/read/read-patterns.constant.ts";
import type { SymbolLineLookup } from "../../../types/tools/read/symbol-line-lookup.interface.ts";

function symbolOnLine(line: string): SymbolLineLookup {
  const declaration = SYMBOL_DECLARATION_PATTERN.exec(line);
  if (declaration !== null && declaration[1] !== undefined) return { found: true, name: declaration[1] };
  if (!INDENTED_LINE_PATTERN.test(line)) return { found: false };
  const method = METHOD_DECLARATION_PATTERN.exec(line);
  if (method === null) return { found: false };
  return method[1] === undefined ? { found: false } : { found: true, name: `${method[1]}()` };
}

export function listSymbols(lines: readonly string[]): string[] {
  const symbols: string[] = [];
  for (const [index, line] of lines.entries()) {
    if (symbols.length >= STRUCTURE_SYMBOL_LIMIT) break;
    const symbol = symbolOnLine(line);
    if (symbol.found) symbols.push(`${index + 1}: ${symbol.name}`);
  }
  return symbols;
}
