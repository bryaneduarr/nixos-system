/** Project directories that the project picker offers from past and live sessions. */
export interface ProjectSource {
  /** Lists canonical project directories that have live or past sessions. */
  readonly projects: () => Promise<readonly string[]>;
}
