import { ROLE_FILE_PATTERN } from "../../constants/audit/file-roles.constant.ts";
import type { AuditFinding } from "../../types/audit/audit-finding.interface.ts";

export function checkRoleSuffix(file: string): readonly AuditFinding[] {
  const isProjectRootEntry = !file.includes("/");
  return ROLE_FILE_PATTERN.test(file) || isProjectRootEntry ? [] : [{ file, line: 0, rule: "missing-role-suffix" }];
}
