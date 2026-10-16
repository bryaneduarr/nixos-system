import type { SearchMatch } from "./search-match.interface.ts";

/** Matches and file names that one search result shows. */
export interface SearchResultSections {
  /** Query as the caller wrote it after trimming. */
  readonly query: string;
  /** Strategy text shown in the result heading. */
  readonly strategyLabel: string;
  /** Matching file paths. */
  readonly files: readonly string[];
  /** Matches in test files. */
  readonly tests: readonly SearchMatch[];
  /** Matches outside test files that are not definitions. */
  readonly references: readonly SearchMatch[];
  /** Matches that declare the searched name. */
  readonly definitions: readonly SearchMatch[];
  /** Maximum entries shown per section. */
  readonly limit: number;
}
