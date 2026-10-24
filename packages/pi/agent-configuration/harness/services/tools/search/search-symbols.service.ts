import type { SearchRequest } from "../../../types/tools/search/search-request.interface.ts";
import { formatSearchResult } from "./format-search-result.service.ts";
import { isDefinitionLine } from "./is-definition-line.service.ts";
import { rgMatches } from "./rg-matches.service.ts";
import { uniqueByLocation } from "./unique-by-location.service.ts";

export async function searchSymbols(request: SearchRequest): Promise<string> {
  const { query, limit } = request;
  const matches = uniqueByLocation(await rgMatches(request));
  const definitions = matches.filter((match) => isDefinitionLine(match.text, query));
  const hasDefinitions = definitions.length > 0;
  return formatSearchResult({
    query,
    strategyLabel: hasDefinitions ? "symbol" : "symbol (no declaration found; showing text matches)",
    files: [],
    tests: [],
    references: hasDefinitions ? definitions : matches,
    definitions: [],
    limit,
  });
}
