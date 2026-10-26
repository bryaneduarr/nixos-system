import { BANNED_NAME_PATTERN } from "../../constants/audit/file-roles.constant.ts";
import type { AuditFinding } from "../../types/audit/audit-finding.interface.ts";

export function checkBannedName(file: string): readonly AuditFinding[] {
  return BANNED_NAME_PATTERN.test(file) ? [{ file, line: 0, rule: "banned-name" }] : [];
}
