import { SEARCH_SECTION_TITLES } from "../../../constants/tool-rendering/details/search-section-title.constant.ts";

export function isSearchMetadataLine(line: string): boolean {
  const isEmpty = line === "";
  const isSearchHeader = line.startsWith("search ");
  const isSectionTitle = SEARCH_SECTION_TITLES.has(line);
  const isAdditionalNote = line.startsWith("Additional ");
  const isFullOutputNote = line.startsWith("Full output:");
  const isBracketedNote = line.startsWith("[") && line.endsWith("]");
  return isEmpty || isSearchHeader || isSectionTitle || isAdditionalNote || isFullOutputNote || isBracketedNote;
}
