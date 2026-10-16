import { z } from "zod";
import { AUDIT_RULES } from "../../constants/audit/audit-rules.constant.ts";

export const auditRuleSchema = z.enum(AUDIT_RULES);

export const ruleAuditBoundarySchema = z.strictObject({
  /* File path relative to the audited project directory. */
  file: z.string().min(1),
  /* Rule this file is allowed to break. */
  rule: auditRuleSchema,
  /* Why the file must break the rule, such as converting a library value once. */
  reason: z.string().min(1),
});

export const ruleAuditBoundariesSchema = z.strictObject({
  /* Files allowed to break one rule each, with the reason. */
  boundaries: z.array(ruleAuditBoundarySchema),
});
