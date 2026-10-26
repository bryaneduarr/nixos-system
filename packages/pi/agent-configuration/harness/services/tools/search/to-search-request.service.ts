import { DEFAULT_SEARCH_KIND } from "../../../constants/tools/search/search-kinds.constant.ts";
import { DEFAULT_SEARCH_LIMIT } from "../../../constants/tools/search/search-limits.constant.ts";
import type { SearchEnvironment } from "../../../types/tools/search/search-environment.interface.ts";
import type { SearchParameters } from "../../../types/tools/search/search-parameters.interface.ts";
import type { SearchRequest } from "../../../types/tools/search/search-request.interface.ts";

export function toSearchRequest(parameters: SearchParameters, environment: SearchEnvironment): SearchRequest {
  const { cwd, backend, cancellation } = environment;
  return {
    cwd,
    query: parameters.query,
    kind: parameters.kind ?? DEFAULT_SEARCH_KIND,
    scope: parameters.path ? { kind: "path", path: parameters.path } : { kind: "workspace" },
    limit: parameters.limit ?? DEFAULT_SEARCH_LIMIT,
    cancellation,
    backend,
  };
}
