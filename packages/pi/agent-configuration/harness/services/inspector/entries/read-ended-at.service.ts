import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";
import type { InspectorRow } from "../../../types/inspector/detail/inspector-row.interface.ts";

export function readEndedAt(row: InspectorRow): ValueState<number> {
  if (row.level === "entry") return row.entry.endedAt;
  return row.sub.endedAt.state === "present" ? row.sub.endedAt : row.entry.endedAt;
}
