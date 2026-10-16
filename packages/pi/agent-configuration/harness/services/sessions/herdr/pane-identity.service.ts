import { Value } from "typebox/value";
import { HerdrPaneSchema } from "../../../schemas/sessions/herdr-pane.schema.ts";
import type { PaneIdentity } from "../../../types/sessions/herdr/pane-identity.interface.ts";
import { readObjectValue } from "./read-object-value.service.ts";

export function paneIdentity(value: unknown): PaneIdentity {
  const row = readObjectValue(value);
  if (!Value.Check(HerdrPaneSchema, row)) throw new Error("Herdr returned an invalid pane identity");
  const isPaneInWorkspace = row.pane_id.startsWith(`${row.workspace_id}:`);
  const isTabInWorkspace = row.tab_id.startsWith(`${row.workspace_id}:`);
  if (!isPaneInWorkspace || !isTabInWorkspace) throw new Error("Herdr pane belongs to another workspace");
  return { pane: row.pane_id, tab: row.tab_id, workspace: row.workspace_id };
}
