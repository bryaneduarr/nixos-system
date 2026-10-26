import type { SourceLine } from "../../types/source/source-line.interface.ts";
import { stripStringsAndComments } from "./strip-strings-and-comments.service.ts";

const MODULE_CLAUSE_START = /^\s*(import\b|export\s+(type\s+)?\{|export\s+\*)/;
const MODULE_CLAUSE_END = /;\s*$|\bfrom\b/;

export function readSourceLines(sourceText: string): readonly SourceLine[] {
  const originalLines = sourceText.split("\n");
  const codeLines = stripStringsAndComments(sourceText).split("\n");
  const sourceLines: SourceLine[] = [];
  let continuesModuleClause = false;

  originalLines.forEach((original, index) => {
    const code = codeLines[index];
    if (code === undefined) throw new Error("Stripping strings and comments changed the number of lines");
    const inModuleClause = continuesModuleClause || MODULE_CLAUSE_START.test(code);
    continuesModuleClause = inModuleClause && !MODULE_CLAUSE_END.test(code);
    sourceLines.push({
      lineNumber: index + 1,
      original,
      code,
      inModuleClause,
    });
  });

  return sourceLines;
}
