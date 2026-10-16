import { RULE_MESSAGES } from "../../constants/audit/rule-messages.constant.ts";
import type { AuditFinding } from "../../types/audit/audit-finding.interface.ts";

export function formatFinding(projectDirectory: string, finding: AuditFinding): string {
  const location = finding.line > 0 ? `${finding.file}:${finding.line}` : finding.file;
  return `${projectDirectory}/${location} ${finding.rule}: ${RULE_MESSAGES[finding.rule]}`;
}
