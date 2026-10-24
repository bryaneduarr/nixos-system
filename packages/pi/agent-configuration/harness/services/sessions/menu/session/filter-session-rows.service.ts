import type { LiveSession } from "../../../../types/sessions/registry/row/live-session.interface.ts";

export function filterSessionRows(rows: readonly LiveSession[], query: string): LiveSession[] {
  const normalizedQuery = query.toLocaleLowerCase();
  return rows.filter((row) =>
    `${row.cwd} ${row.name} ${row.branch} ${row.status}`.toLocaleLowerCase().includes(normalizedQuery),
  );
}
