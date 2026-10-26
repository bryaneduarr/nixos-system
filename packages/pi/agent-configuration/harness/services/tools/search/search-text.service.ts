import type { SearchRequest } from "../../../types/tools/search/search-request.interface.ts";
import { fdMatches } from "./fd-matches.service.ts";
import { formatMixedResult } from "./format-mixed-result.service.ts";
import { rgMatches } from "./rg-matches.service.ts";
import { uniqueByLocation } from "./unique-by-location.service.ts";

export async function searchText(request: SearchRequest): Promise<string> {
  const { query, kind, limit } = request;
  const matches = uniqueByLocation(await rgMatches(request));
  const files = kind === "text" ? [] : await fdMatches(request);
  return formatMixedResult({ query, strategyLabel: kind, files, matches, limit });
}
