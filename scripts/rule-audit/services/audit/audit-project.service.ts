import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { AuditFinding } from "../../types/audit/audit-finding.interface.ts";
import type { RuleAuditBoundaries } from "../../types/boundaries/rule-audit-boundaries.interface.ts";
import type { AuditedFile } from "../../types/source/audited-file.interface.ts";
import { applyBoundaries } from "../boundaries/apply-boundaries.service.ts";
import { listTypescriptFiles } from "../files/list-typescript-files.service.ts";
import { checkBannedName } from "../rules/check-banned-name.service.ts";
import { checkConstantsFolderSize } from "../rules/check-constants-folder-size.service.ts";
import { checkExportCount } from "../rules/check-export-count.service.ts";
import { checkFileLength } from "../rules/check-file-length.service.ts";
import { checkInterfaceCount } from "../rules/check-interface-count.service.ts";
import { checkRoleSuffix } from "../rules/check-role-suffix.service.ts";
import { findDuplicateConstants } from "../rules/find-duplicate-constants.service.ts";
import { findDuplicateFunctions } from "../rules/find-duplicate-functions.service.ts";
import { findFunctionComments } from "../rules/find-function-comments.service.ts";
import { findLinePatternFindings } from "../rules/find-line-pattern-findings.service.ts";
import { findPlainBlockComments } from "../rules/find-plain-block-comments.service.ts";
import { findUncheckedDefaults } from "../rules/find-unchecked-defaults.service.ts";
import { findPositionalParameters } from "../rules/parameters/find-positional-parameters.service.ts";
import { readSourceLines } from "../source/read-source-lines.service.ts";

function auditFile({ file, lines }: AuditedFile): readonly AuditFinding[] {
  return [
    ...findLinePatternFindings(file, lines),
    ...findFunctionComments(file, lines),
    ...findPlainBlockComments(file, lines),
    ...findUncheckedDefaults(file, lines),
    ...findPositionalParameters(file, lines),
    ...checkFileLength(file, lines),
    ...checkExportCount(file, lines),
    ...checkInterfaceCount(file, lines),
    ...checkBannedName(file),
    ...checkRoleSuffix(file),
  ];
}

function auditAcrossFiles(files: readonly AuditedFile[]): readonly AuditFinding[] {
  return [...findDuplicateConstants(files), ...findDuplicateFunctions(files), ...checkConstantsFolderSize(files)];
}

export function auditProject(projectDirectory: string, allowlist: RuleAuditBoundaries): readonly AuditFinding[] {
  const files = listTypescriptFiles(projectDirectory).map((file) => ({
    file,
    lines: readSourceLines(readFileSync(join(projectDirectory, file), "utf8")),
  }));
  return applyBoundaries([...files.flatMap(auditFile), ...auditAcrossFiles(files)], allowlist);
}
