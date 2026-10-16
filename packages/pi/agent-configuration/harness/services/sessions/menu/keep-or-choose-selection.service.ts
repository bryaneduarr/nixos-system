import type { LiveSession } from "../../../types/sessions/registry/live-session.interface.ts";

export function keepOrChooseSelection(visible: readonly LiveSession[], selectedId: string, pid: number): string {
  if (visible.some((row) => row.identity === selectedId)) return selectedId;
  const current = visible.find((row) => row.pid === pid);
  if (current) return current.identity;
  const first = visible[0];
  return first ? first.identity : "";
}
