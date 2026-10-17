import type { z } from "zod";
import type { STALE_BOUNDARY_RULE } from "../../constants/audit/audit-rules.constant.ts";
import type { auditRuleSchema } from "../../schemas/boundaries/rule-audit-boundaries.schema.ts";

/** Name of a rule that source code can break. */
export type AuditRule = z.output<typeof auditRuleSchema>;

/** Name of any reported problem, including allowlist entries that no longer match. */
export type ReportedRule = AuditRule | typeof STALE_BOUNDARY_RULE;
