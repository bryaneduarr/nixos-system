import { NEVER_CHECK_PATTERN, SWITCH_DEFAULT_PATTERN } from "../../constants/audit/switch-default.constant.ts";
import type { AuditFinding } from "../../types/audit/audit-finding.interface.ts";
import type { SourceLine } from "../../types/source/source-line.interface.ts";

const LINES_TO_INSPECT = 3;

export function findUncheckedDefaults(file: string, lines: readonly SourceLine[]): readonly AuditFinding[] {
  return lines
    .filter((line, index) => {
      if (!SWITCH_DEFAULT_PATTERN.test(line.code)) return false;
      const defaultBody = lines.slice(index, index + LINES_TO_INSPECT);
      return !defaultBody.some((bodyLine) => NEVER_CHECK_PATTERN.test(bodyLine.code));
    })
    .map((line) => ({ file, line: line.lineNumber, rule: "unchecked-default" }));
}
