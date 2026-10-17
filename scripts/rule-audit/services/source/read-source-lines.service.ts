import type { SourceLine } from "../../types/source/source-line.interface.ts";
import { stripStringsAndComments } from "./strip-strings-and-comments.service.ts";

const MODULE_CLAUSE_START = /^\s*(import\b|export\s+(type\s+)?\{|export\s+\*)/;
const MODULE_CLAUSE_END = /;\s*$|\bfrom\b/;

export function readSourceLines(sourceText: string): readonly SourceLine[] {
  const originalLines = sourceText.split("\n");
  const codeLines = stripStringsAndComments(sourceText).split("\n");
  const sourceLines: SourceLine[] = [];
  let continuesModuleClause = false;

  codeLines.forEach((code, index) => {
    const inModuleClause = continuesModuleClause || MODULE_CLAUSE_START.test(code);
    continuesModuleClause = inModuleClause && !MODULE_CLAUSE_END.test(code);
    sourceLines.push({
      lineNumber: index + 1,
      original: originalLines.at(index) ?? "",
      code,
      inModuleClause,
    });
  });

  return sourceLines;
}
