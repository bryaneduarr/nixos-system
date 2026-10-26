import { LINE_PATTERN_RULES } from "../../constants/audit/line-pattern-rules.constant.ts";
import type { AuditFinding } from "../../types/audit/audit-finding.interface.ts";
import type { SourceLine } from "../../types/source/source-line.interface.ts";

export function findLinePatternFindings(file: string, lines: readonly SourceLine[]): readonly AuditFinding[] {
  const fileRules = LINE_PATTERN_RULES.filter((patternRule) => patternRule.filePattern.test(file));
  return lines.flatMap((line) =>
    fileRules
      .filter((patternRule) => {
        const ruleApplies = patternRule.appliesInModuleClause || !line.inModuleClause;
        return ruleApplies && patternRule.pattern.test(line.code);
      })
      .map((patternRule) => ({ file, line: line.lineNumber, rule: patternRule.rule })),
  );
}
