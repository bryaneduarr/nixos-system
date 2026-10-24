import { MAX_POSITIONAL_PARAMETERS } from "../../../constants/audit/audit-rules.constant.ts";
import {
  ARROW_AFTER_PARAMETERS,
  FUNCTION_KEYWORD_BEFORE_PARAMETERS,
  PARAMETER_SCAN_WINDOW,
} from "../../../constants/audit/function-signature.constant.ts";
import type { AuditFinding } from "../../../types/audit/audit-finding.interface.ts";
import type { SourceLine } from "../../../types/source/source-line.interface.ts";
import { countPositionalParameters } from "./count-positional-parameters.service.ts";
import { matchParentheses } from "./match-parentheses.service.ts";

export function findPositionalParameters(file: string, lines: readonly SourceLine[]): readonly AuditFinding[] {
  const code = lines.map((line) => line.code).join("\n");
  const findings: AuditFinding[] = [];
  for (const [openIndex, closeIndex] of matchParentheses(code)) {
    const beforeParameters = code.slice(Math.max(0, openIndex - PARAMETER_SCAN_WINDOW), openIndex);
    const isFunctionDeclaration = FUNCTION_KEYWORD_BEFORE_PARAMETERS.test(beforeParameters);
    const isArrowFunction = ARROW_AFTER_PARAMETERS.test(
      code.slice(closeIndex + 1, closeIndex + 1 + PARAMETER_SCAN_WINDOW),
    );
    const tooManyParameters =
      countPositionalParameters(code.slice(openIndex + 1, closeIndex)) > MAX_POSITIONAL_PARAMETERS;
    if ((isFunctionDeclaration || isArrowFunction) && tooManyParameters) {
      const lineNumber = code.slice(0, openIndex).split("\n").length;
      findings.push({ file, line: lineNumber, rule: "positional-parameters" });
    }
  }
  return findings;
}
