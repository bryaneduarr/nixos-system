import { MAX_FILE_LINES } from "../../constants/audit/audit-rules.constant.ts";
import type { AuditFinding } from "../../types/audit/audit-finding.interface.ts";
import type { SourceLine } from "../../types/source/source-line.interface.ts";

export function checkFileLength(file: string, lines: readonly SourceLine[]): readonly AuditFinding[] {
  const lastLine = lines.at(-1);
  const endsWithNewline = lastLine !== undefined && lastLine.original === "";
  const lineCount = endsWithNewline ? lines.length - 1 : lines.length;
  return lineCount > MAX_FILE_LINES ? [{ file, line: 0, rule: "file-length" }] : [];
}
