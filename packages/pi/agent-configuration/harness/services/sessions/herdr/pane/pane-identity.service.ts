import { Value } from "typebox/value";
import { HerdrPaneSchema } from "../../../../schemas/sessions/herdr/pane/herdr-pane.schema.ts";
import type { PaneIdentity } from "../../../../types/sessions/herdr/pane/pane-identity.interface.ts";
import { readObjectValue } from "../response/read-object-value.service.ts";

export function paneIdentity(candidate: unknown): PaneIdentity {
  const paneRecord = readObjectValue(candidate);
  if (!Value.Check(HerdrPaneSchema, paneRecord)) throw new Error("Herdr returned an invalid pane identity");
  const isPaneInWorkspace = paneRecord.pane_id.startsWith(`${paneRecord.workspace_id}:`);
  const isTabInWorkspace = paneRecord.tab_id.startsWith(`${paneRecord.workspace_id}:`);
  if (!isPaneInWorkspace || !isTabInWorkspace) throw new Error("Herdr pane belongs to another workspace");
  return { pane: paneRecord.pane_id, tab: paneRecord.tab_id, workspace: paneRecord.workspace_id };
}
