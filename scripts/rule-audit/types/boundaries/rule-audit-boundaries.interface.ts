import type { z } from "zod";
import type {
  ruleAuditBoundariesSchema,
  ruleAuditBoundarySchema,
} from "../../schemas/boundaries/rule-audit-boundaries.schema.ts";

/** One file allowed to break one rule, with its reason. */
export type RuleAuditBoundary = z.output<typeof ruleAuditBoundarySchema>;

/** Validated contents of a project's boundary allowlist. */
export type RuleAuditBoundaries = z.output<typeof ruleAuditBoundariesSchema>;

/** Result of reading a project's boundary allowlist. */
export type BoundariesLookup =
  | {
      /** The allowlist exists and is valid. */
      readonly state: "valid";
      /** The validated allowlist. */
      readonly boundaries: RuleAuditBoundaries;
    }
  | {
      /** The allowlist is missing or invalid. */
      readonly state: "invalid";
      /** Explanation for the user. */
      readonly problem: string;
    };
