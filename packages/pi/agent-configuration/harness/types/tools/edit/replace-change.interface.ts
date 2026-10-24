import type { TextEdit } from "./text-edit.interface.ts";

/** Exact text replacements applied to an existing file. */
export interface ReplaceChange {
  /** Marks a replacement. */
  readonly op: "replace";
  /** Target file as the caller wrote it. */
  readonly path: string;
  /** Replacements applied in order; empty when the caller gave none. */
  readonly edits: readonly TextEdit[];
  /** Whether every occurrence of each oldText is replaced. */
  readonly replaceAll: boolean;
}
