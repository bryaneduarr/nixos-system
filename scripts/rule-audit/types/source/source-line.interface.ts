/** One line of a source file, prepared for pattern rules. */
export interface SourceLine {
  /** One-based line number in the file. */
  readonly lineNumber: number;
  /** Line text exactly as written. */
  readonly original: string;
  /** Line text with string contents and comments replaced by spaces. */
  readonly code: string;
  /** Whether the line belongs to an import or export clause, where `as` renames instead of casting. */
  readonly inModuleClause: boolean;
}
