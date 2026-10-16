/** Sections extracted from a worker's final text report. */
export interface ParsedTaskOutput {
  /** Summary section, or the full text when the section is missing. */
  readonly summary: string;
  /** Items of the findings section. */
  readonly findings: string[];
  /** Items of the unresolved questions section. */
  readonly unresolvedQuestions: string[];
  /** Items of the checks section. */
  readonly checks: string[];
  /** Items of the files changed section. */
  readonly filesChanged: string[];
  /** Items of the risks section. */
  readonly risks: string[];
  /** Items of the errors section. */
  readonly errors: string[];
}
