import { STRUCTURE_SYMBOL_LIMIT } from "../../../constants/tools/read-limits.constant.ts";
import {
  INDENTED_LINE_PATTERN,
  METHOD_DECLARATION_PATTERN,
  SYMBOL_DECLARATION_PATTERN,
} from "../../../constants/tools/read-patterns.constant.ts";
import type { SymbolLineLookup } from "../../../types/tools/read/symbol-line-lookup.interface.ts";

function symbolOnLine(line: string): SymbolLineLookup {
  const declarationName = SYMBOL_DECLARATION_PATTERN.exec(line)?.[1];
  if (declarationName !== undefined) return { found: true, name: declarationName };
  if (!INDENTED_LINE_PATTERN.test(line)) return { found: false };
  const methodName = METHOD_DECLARATION_PATTERN.exec(line)?.[1];
  return methodName === undefined ? { found: false } : { found: true, name: `${methodName}()` };
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
