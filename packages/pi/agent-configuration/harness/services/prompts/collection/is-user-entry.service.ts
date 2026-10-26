import type { SessionEntry } from "@earendil-works/pi-coding-agent";

export function isUserEntry(entry: SessionEntry): boolean {
  return entry.type === "message" && entry.message.role === "user";
}
