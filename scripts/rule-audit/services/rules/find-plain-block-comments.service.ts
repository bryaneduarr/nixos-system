import { PLAIN_BLOCK_COMMENT_PATTERN } from "../../constants/audit/line-pattern-rules.constant.ts";
import type { AuditFinding } from "../../types/audit/audit-finding.interface.ts";
import type { SourceLine } from "../../types/source/source-line.interface.ts";

export function findPlainBlockComments(file: string, lines: readonly SourceLine[]): readonly AuditFinding[] {
  return lines
    .filter((line) => PLAIN_BLOCK_COMMENT_PATTERN.test(line.original))
    .map((line) => ({ file, line: line.lineNumber, rule: "plain-block-comment" }));
}
