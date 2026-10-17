import { existsSync, readFileSync } from "node:fs";
import { ruleAuditBoundariesSchema } from "../../schemas/boundaries/rule-audit-boundaries.schema.ts";
import type { BoundariesLookup } from "../../types/boundaries/rule-audit-boundaries.interface.ts";
import { parseExceptionsTable } from "./parse-exceptions-table.service.ts";

export function readBoundaries(exceptionsPath: string): BoundariesLookup {
  if (!existsSync(exceptionsPath)) {
    return { state: "invalid", problem: `${exceptionsPath} is missing.` };
  }
  try {
    const rows = parseExceptionsTable(readFileSync(exceptionsPath, "utf8"));
    const parsed = ruleAuditBoundariesSchema.safeParse({ boundaries: rows });
    if (parsed.success) return { state: "valid", boundaries: parsed.data };
    return { state: "invalid", problem: `${exceptionsPath} has an invalid exceptions table: ${parsed.error.message}` };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return { state: "invalid", problem: `${exceptionsPath} could not be read: ${reason}` };
  }
}
