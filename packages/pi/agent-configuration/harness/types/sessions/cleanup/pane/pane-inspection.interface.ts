/** Herdr responses that describe the tab, pane, and processes of a pane about to close. */
export interface PaneInspection {
  /** Tab response as Herdr returned it. */
  readonly tab: unknown;
  /** Pane response as Herdr returned it. */
  readonly pane: unknown;
  /** Process information response as Herdr returned it. */
  readonly processInfo: unknown;
}
