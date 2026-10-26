import type { SEARCH_KINDS } from "../../../constants/tools/search/search-kinds.constant.ts";

/** Strategy of a search. */
export type SearchKind = (typeof SEARCH_KINDS)[number];
