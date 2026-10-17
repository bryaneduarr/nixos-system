import { describe, expect, test } from "bun:test";
import type { AuditFinding } from "../../types/audit/audit-finding.interface.ts";
import { applyBoundaries } from "./apply-boundaries.service.ts";

const BOUNDARY_FINDING: AuditFinding = { file: "boundary.ts", line: 4, rule: "nullable-union" };
const OTHER_FINDING: AuditFinding = { file: "service.ts", line: 9, rule: "nullable-union" };

describe("applyBoundaries", () => {
  test("hides findings of allowlisted files and rules only", () => {
    const allowlist = { boundaries: [{ file: "boundary.ts", rule: "nullable-union" as const, reason: "Pi value." }] };
    expect(applyBoundaries([BOUNDARY_FINDING, OTHER_FINDING], allowlist)).toEqual([OTHER_FINDING]);
  });

  test("reports allowlist entries that no longer match a finding", () => {
    const allowlist = { boundaries: [{ file: "fixed.ts", rule: "optional-chaining" as const, reason: "Old." }] };
    expect(applyBoundaries([], allowlist)).toEqual([{ file: "fixed.ts", line: 0, rule: "stale-boundary" }]);
  });
});
