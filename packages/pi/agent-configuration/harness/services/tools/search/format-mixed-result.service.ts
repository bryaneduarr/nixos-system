import type { MixedSearchResult } from "../../../types/tools/search/mixed-search-result.interface.ts";
import { formatSearchResult } from "./format-search-result.service.ts";
import { isDefinitionLine } from "./is-definition-line.service.ts";
import { isTestFile } from "./is-test-file.service.ts";

export function formatMixedResult(result: MixedSearchResult): string {
  const { query, strategyLabel, files, matches, limit } = result;
  const definitions = matches.filter((match) => isDefinitionLine(match.text, query));
  const tests = matches.filter((match) => isTestFile(match.file));
  const references = matches.filter((match) => !isDefinitionLine(match.text, query) && !isTestFile(match.file));
  return formatSearchResult({ query, strategyLabel, files, tests, references, definitions, limit });
}
