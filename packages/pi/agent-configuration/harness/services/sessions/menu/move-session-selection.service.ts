import { matchesKey } from "@earendil-works/pi-tui";
import type { LiveSession } from "../../../types/sessions/registry/live-session.interface.ts";

export function moveSessionSelection(visible: readonly LiveSession[], selectedId: string, key: string): string {
  const index = visible.findIndex((row) => row.identity === selectedId);
  const target = visible[nextSelectionIndex(index, visible.length, key)];
  return target ? target.identity : "";
}

function nextSelectionIndex(index: number, length: number, key: string): number {
  if (matchesKey(key, "k") || matchesKey(key, "up")) return Math.max(0, index - 1);
  if (matchesKey(key, "j") || matchesKey(key, "down")) return Math.min(length - 1, index + 1);
  return index;
}
