import type { SearchMatch } from "../../../types/tools/search/search-match.interface.ts";
import { locationKey } from "./location-key.service.ts";

export function uniqueByLocation(matches: readonly SearchMatch[]): SearchMatch[] {
  const seen = new Set<string>();
  const result: SearchMatch[] = [];
  for (const match of matches) {
    const key = locationKey(match);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(match);
  }
  return result;
}
