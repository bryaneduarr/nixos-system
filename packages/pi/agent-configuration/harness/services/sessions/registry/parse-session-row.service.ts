import { Value } from "typebox/value";
import { SessionRowSchema } from "../../../schemas/sessions/registry/session-row.schema.ts";
import type { SessionRowParse } from "../../../types/sessions/registry/session-row-parse.interface.ts";

export function parseSessionRow(value: unknown): SessionRowParse {
  if (!Value.Check(SessionRowSchema, value)) return { valid: false };
  const isPaneInWorkspace = value.pane.startsWith(`${value.workspace}:`);
  const isTabInWorkspace = value.tab.startsWith(`${value.workspace}:`);
  if (!isPaneInWorkspace || !isTabInWorkspace) return { valid: false };
  return { valid: true, row: value };
}
