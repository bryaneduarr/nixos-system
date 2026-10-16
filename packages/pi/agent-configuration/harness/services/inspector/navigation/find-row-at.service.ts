import type { InspectorRow } from "../../../types/inspector/detail/inspector-row.interface.ts";
import type { InspectorRowLookup } from "../../../types/inspector/detail/inspector-row-lookup.interface.ts";

export function findRowAt(rows: readonly InspectorRow[], index: number): InspectorRowLookup {
  const row = rows[index];
  return row ? { found: true, row } : { found: false };
}
