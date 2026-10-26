import type { SearchRequest } from "../../../types/tools/search/search-request.interface.ts";
import { fdMatches } from "./fd-matches.service.ts";

export async function searchFiles(request: SearchRequest): Promise<string> {
  const { query, limit } = request;
  const files = await fdMatches(request);
  const shown = files.slice(0, limit);
  if (shown.length === 0) return `No files matching: ${query}`;
  const omitted = Math.max(0, files.length - limit);
  const omittedNote = omitted > 0 ? `\n\nAdditional files omitted: ${omitted}` : "";
  return `Files:\n${shown.join("\n")}${omittedNote}`;
}
