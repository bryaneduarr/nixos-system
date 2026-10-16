import { STALE_BOUNDARY_RULE } from "../../constants/audit/audit-rules.constant.ts";
import type { AuditFinding } from "../../types/audit/audit-finding.interface.ts";
import type { RuleAuditBoundaries, RuleAuditBoundary } from "../../types/boundaries/rule-audit-boundaries.interface.ts";

function coversFinding(boundary: RuleAuditBoundary, finding: AuditFinding): boolean {
  return boundary.file === finding.file && boundary.rule === finding.rule;
}

export function applyBoundaries(
  findings: readonly AuditFinding[],
  allowlist: RuleAuditBoundaries,
): readonly AuditFinding[] {
  const unallowedFindings = findings.filter(
    (finding) => !allowlist.boundaries.some((boundary) => coversFinding(boundary, finding)),
  );
  const staleBoundaryFindings = allowlist.boundaries
    .filter((boundary) => !findings.some((finding) => coversFinding(boundary, finding)))
    .map((boundary): AuditFinding => ({ file: boundary.file, line: 0, rule: STALE_BOUNDARY_RULE }));
  return [...unallowedFindings, ...staleBoundaryFindings];
}
