import { firstLine } from "../text/first-line.service.ts";
import { countSearchEntries } from "./count-search-entries.service.ts";

export function searchDetail(text: string): string {
  const header = /^search ".*" \(([^)]+)\)/.exec(firstLine(text));
  if (/No (?:matches|files|structural)/.test(text)) return "0 matches";
  const count = countSearchEntries(text);
  const headerKind = header === null ? undefined : header[1];
  const kind = headerKind !== undefined && !headerKind.includes("fallback") ? ` (${headerKind})` : "";
  return `${count} match${count === 1 ? "" : "es"}${kind}`;
}
