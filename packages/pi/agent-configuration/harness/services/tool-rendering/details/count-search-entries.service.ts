import { isSearchMetadataLine } from "./is-search-metadata-line.service.ts";

export function countSearchEntries(text: string): number {
  return text
    .split(/\r?\n/)
    .map((raw) => raw.trim())
    .filter((line) => !isSearchMetadataLine(line)).length;
}
