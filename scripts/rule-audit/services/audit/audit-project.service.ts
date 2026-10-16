import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { AuditFinding } from "../../types/audit/audit-finding.interface.ts";
import type { RuleAuditBoundaries } from "../../types/boundaries/rule-audit-boundaries.interface.ts";
import { applyBoundaries } from "../boundaries/apply-boundaries.service.ts";
import { listTypescriptFiles } from "../files/list-typescript-files.service.ts";
import { checkFileLength } from "../rules/check-file-length.service.ts";
import { findFunctionComments } from "../rules/find-function-comments.service.ts";
import { findLinePatternFindings } from "../rules/find-line-pattern-findings.service.ts";
import { findPlainBlockComments } from "../rules/find-plain-block-comments.service.ts";
import { readSourceLines } from "../source/read-source-lines.service.ts";

function auditFile(projectDirectory: string, file: string): readonly AuditFinding[] {
  const lines = readSourceLines(readFileSync(join(projectDirectory, file), "utf8"));
  return [
    ...findLinePatternFindings(file, lines),
    ...findFunctionComments(file, lines),
    ...findPlainBlockComments(file, lines),
    ...checkFileLength(file, lines),
  ];
}

export function auditProject(projectDirectory: string, allowlist: RuleAuditBoundaries): readonly AuditFinding[] {
  const findings = listTypescriptFiles(projectDirectory).flatMap((file) => auditFile(projectDirectory, file));
  return applyBoundaries(findings, allowlist);
}
