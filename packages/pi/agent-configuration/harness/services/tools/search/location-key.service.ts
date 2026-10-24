import type { SearchMatch } from "../../../types/tools/search/search-match.interface.ts";

export function locationKey(match: SearchMatch): string {
  return `${match.file}:${match.line}`;
}
