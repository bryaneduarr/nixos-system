import {
  COMMENT_END_PATTERN,
  FUNCTION_DECLARATION_PATTERNS,
} from "../../constants/audit/line-pattern-rules.constant.ts";
import type { AuditFinding } from "../../types/audit/audit-finding.interface.ts";
import type { SourceLine } from "../../types/source/source-line.interface.ts";

function declaresFunction(line: SourceLine): boolean {
  return FUNCTION_DECLARATION_PATTERNS.some((pattern) => pattern.test(line.code));
}

export function findFunctionComments(file: string, lines: readonly SourceLine[]): readonly AuditFinding[] {
  return lines
    .filter((line, index) => {
      const previousLine = lines.at(index - 1);
      const hasPreviousLine = index > 0 && previousLine !== undefined;
      return hasPreviousLine && declaresFunction(line) && COMMENT_END_PATTERN.test(previousLine.original);
    })
    .map((line) => ({ file, line: line.lineNumber, rule: "function-comment" }));
}
