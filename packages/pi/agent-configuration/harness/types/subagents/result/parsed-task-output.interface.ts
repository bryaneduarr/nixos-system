/** Sections extracted from a worker's final text report. */
export interface ParsedTaskOutput {
  /** Summary section, or the full text when the section is missing. */
  readonly summary: string;
  /** Items of the findings section. */
  readonly findings: readonly string[];
  /** Items of the unresolved questions section. */
  readonly unresolvedQuestions: readonly string[];
  /** Items of the checks section. */
  readonly checks: readonly string[];
  /** Items of the files changed section. */
  readonly filesChanged: readonly string[];
  /** Items of the risks section. */
  readonly risks: readonly string[];
  /** Items of the errors section. */
  readonly errors: readonly string[];
}
