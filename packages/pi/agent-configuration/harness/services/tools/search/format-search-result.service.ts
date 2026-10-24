import type { SearchMatch } from "../../../types/tools/search/search-match.interface.ts";
import type { SearchResultSections } from "../../../types/tools/search/search-result-sections.interface.ts";
import { locationKey } from "./location-key.service.ts";

function formatLocations(matches: readonly SearchMatch[], limit: number): string {
  return matches.slice(0, limit).map(locationKey).join("\n");
}

export function formatSearchResult(sections: SearchResultSections): string {
  const { query, strategyLabel, files, tests, references, definitions, limit } = sections;
  const output: string[] = [];
  const shownIds = new Set<string>();

  const push = (title: string, body: string) => {
    if (body) output.push(`${title}:\n${body}`);
  };

  if (definitions.length > 0) {
    const shown = definitions.slice(0, limit);
    for (const match of shown) shownIds.add(locationKey(match));
    push("Definition", formatLocations(shown, limit));
  }

  if (files.length > 0) {
    const shown = files.slice(0, limit);
    for (const file of shown) shownIds.add(file);
    push("Files", shown.join("\n"));
  }

  if (tests.length > 0) {
    const shown = tests.slice(0, limit);
    for (const match of shown) shownIds.add(locationKey(match));
    const testFiles = [...new Set(shown.map((match) => match.file))];
    push("Tests", testFiles.join("\n"));
  }

  const uniqueReferences = references.filter((match) => !shownIds.has(locationKey(match)));
  if (uniqueReferences.length > 0) {
    push("References", formatLocations(uniqueReferences, limit));
  }

  if (output.length === 0) return `No matches for: ${query}`;

  const shownCount =
    Math.min(definitions.length, limit) +
    Math.min(files.length, limit) +
    Math.min(tests.length, limit) +
    Math.min(uniqueReferences.length, limit);
  const totalCount = definitions.length + files.length + tests.length + uniqueReferences.length;
  const omitted = Math.max(0, totalCount - shownCount);
  if (omitted > 0) output.push(`Additional matches omitted: ${omitted}`);

  return `search "${query}" (${strategyLabel})\n\n${output.join("\n\n")}`;
}
