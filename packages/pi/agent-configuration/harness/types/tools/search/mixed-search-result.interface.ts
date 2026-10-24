import type { SearchMatch } from "./search-match.interface.ts";

/** File names and line matches that are classified into definitions, tests, and references. */
export interface MixedSearchResult {
  /** Query as the caller wrote it after trimming. */
  readonly query: string;
  /** Strategy text shown in the result heading. */
  readonly strategyLabel: string;
  /** Matching file paths. */
  readonly files: readonly string[];
  /** Line matches to classify. */
  readonly matches: readonly SearchMatch[];
  /** Maximum entries shown per section. */
  readonly limit: number;
}
