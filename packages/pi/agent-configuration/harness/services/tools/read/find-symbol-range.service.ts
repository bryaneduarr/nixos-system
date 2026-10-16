import { DECLARATION_KEYWORDS } from "../../../constants/tools/read-patterns.constant.ts";
import type { SymbolRangeLookup } from "../../../types/tools/read/symbol-range-lookup.interface.ts";
import { escapeRegExp } from "../text/escape-reg-exp.service.ts";
import { findSymbolEnd } from "./find-symbol-end.service.ts";

function declarationPattern(symbol: string): RegExp {
  const name = escapeRegExp(symbol);
  return new RegExp(
    `^\\s*(?:export\\s+)?(?:default\\s+)?(?:async\\s+)?(?:${DECLARATION_KEYWORDS})\\s+${name}\\b|^\\s*(?:public|private|protected|static|async|get|set|readonly|override|\\s)*${name}\\s*\\(`,
  );
}

export function findSymbolRange(lines: readonly string[], symbol: string): SymbolRangeLookup {
  const pattern = declarationPattern(symbol);
  const start = lines.findIndex((line) => pattern.test(line));
  if (start === -1) return { found: false };
  return { found: true, start, end: findSymbolEnd(lines, start) };
}
