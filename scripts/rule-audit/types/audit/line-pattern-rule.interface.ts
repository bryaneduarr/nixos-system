import type { AuditRule } from "./audit-rule.interface.ts";

/* A rule found by matching single lines of code. */
export interface LinePatternRule {
  /* Rule reported when the pattern matches. */
  readonly rule: AuditRule;
  /* Pattern matched against a line with strings and comments blanked. */
  readonly pattern: RegExp;
  /* Whether the rule also applies inside import and export clauses. */
  readonly appliesInModuleClause: boolean;
}
