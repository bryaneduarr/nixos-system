import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { BOUNDARIES_FILE_NAME } from "../../constants/audit/audit-rules.constant.ts";
import { ruleAuditBoundariesSchema } from "../../schemas/boundaries/rule-audit-boundaries.schema.ts";
import type { BoundariesLookup } from "../../types/boundaries/rule-audit-boundaries.interface.ts";

function parseJson(text: string): unknown {
  return JSON.parse(text);
}

export function readBoundaries(projectDirectory: string): BoundariesLookup {
  const boundariesPath = join(projectDirectory, BOUNDARIES_FILE_NAME);
  if (!existsSync(boundariesPath)) {
    return { state: "invalid", problem: `${boundariesPath} is missing; create it with an empty boundaries list.` };
  }
  try {
    const parsed = ruleAuditBoundariesSchema.safeParse(parseJson(readFileSync(boundariesPath, "utf8")));
    if (parsed.success) return { state: "valid", boundaries: parsed.data };
    return { state: "invalid", problem: `${boundariesPath} is invalid: ${parsed.error.message}` };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return { state: "invalid", problem: `${boundariesPath} could not be read: ${reason}` };
  }
}
