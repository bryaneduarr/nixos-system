import type { InspectorRow } from "../../../types/inspector/detail/inspector-row.interface.ts";
import { readEndedAt } from "../entries/read-ended-at.service.ts";
import { formatDuration } from "../format/format-duration.service.ts";

export function rowElapsedLabel(row: InspectorRow): string {
  const startedAt = row.level === "sub" ? row.sub.startedAt : row.entry.startedAt;
  const endedAt = readEndedAt(row);
  const endTime = endedAt.state === "present" ? endedAt.value : Date.now();
  return formatDuration(Math.max(0, endTime - startedAt));
}
