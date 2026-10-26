import type { SearchCommandRequest } from "./search-command-request.interface.ts";

/** A search of git history for commits that touch a text. */
export interface GitHistoryRequest extends SearchCommandRequest {
  /** Maximum commits listed. */
  readonly limit: number;
}
