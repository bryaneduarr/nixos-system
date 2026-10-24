import type { SearchRequest } from "../../../types/tools/search/search-request.interface.ts";
import { backendSearch } from "./backend-search.service.ts";
import { gitHistory } from "./git-history.service.ts";
import { isMissingPath } from "./is-missing-path.service.ts";
import { searchFiles } from "./search-files.service.ts";
import { searchStructural } from "./search-structural.service.ts";
import { searchSymbols } from "./search-symbols.service.ts";
import { searchText } from "./search-text.service.ts";

export async function searchRepo(rawRequest: SearchRequest): Promise<string> {
  const request = { ...rawRequest, query: rawRequest.query.trim() };
  const { cwd, query, scope, limit } = request;

  if (!query) return "No query provided.";
  if (limit <= 0) return "Limit must be greater than zero.";
  if (scope.kind === "path" && (await isMissingPath(cwd, scope.path))) return `Path not found: ${scope.path}`;

  if (request.kind === "history") return gitHistory(request);

  const engineResult = await backendSearch(request);
  if (engineResult.found) return `Strategy: ${engineResult.label}\n\n${engineResult.text}`;

  if (request.kind === "structural") return searchStructural(request);
  if (request.kind === "file") return searchFiles(request);
  if (request.kind === "symbol") return searchSymbols(request);
  if (request.kind === "references") return searchText({ ...request, kind: "text" });
  return searchText(request);
}
