import type { ReportedRule } from "./audit-rule.interface.ts";

/** One rule break found in a project file. */
export interface AuditFinding {
  /** File path relative to the audited project directory. */
  readonly file: string;
  /** One-based line of the break; 0 when the problem concerns the whole file or allowlist. */
  readonly line: number;
  /** Rule that was broken. */
  readonly rule: ReportedRule;
}
