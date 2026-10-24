import type { SearchRequest } from "../../../types/tools/search/search-request.interface.ts";
import { fdMatches } from "./fd-matches.service.ts";
import { formatMixedResult } from "./format-mixed-result.service.ts";
import { formatSearchResult } from "./format-search-result.service.ts";
import { rgMatches } from "./rg-matches.service.ts";
import { structuralMatches } from "./structural-matches.service.ts";
import { uniqueByLocation } from "./unique-by-location.service.ts";

export async function searchStructural(request: SearchRequest): Promise<string> {
  const { query, limit } = request;
  const structural = await structuralMatches(request);
  if (structural.length === 0) {
    const textMatches = await rgMatches(request);
    if (textMatches.length === 0) return `No structural matches for: ${query}`;
    return formatSearchResult({
      query,
      strategyLabel: "structural (no AST matches; text fallback)",
      files: [],
      tests: [],
      references: uniqueByLocation(textMatches),
      definitions: [],
      limit,
    });
  }
  const files = await fdMatches(request);
  return formatMixedResult({ query, strategyLabel: "structural", files, matches: uniqueByLocation(structural), limit });
}
