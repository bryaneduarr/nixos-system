import { Value } from "typebox/value";
import { SessionRowSchema } from "../../../../schemas/sessions/registry/row/session-row.schema.ts";
import type { SessionRowParse } from "../../../../types/sessions/registry/row/session-row-parse.interface.ts";

export function parseSessionRow(rawRow: unknown): SessionRowParse {
  if (!Value.Check(SessionRowSchema, rawRow)) return { valid: false };
  const isPaneInWorkspace = rawRow.pane.startsWith(`${rawRow.workspace}:`);
  const isTabInWorkspace = rawRow.tab.startsWith(`${rawRow.workspace}:`);
  if (!isPaneInWorkspace || !isTabInWorkspace) return { valid: false };
  return { valid: true, row: rawRow };
}
