/** Herdr identifiers of the pane, tab, and workspace that host a Pi session. */
export interface PaneIdentity {
  /** Herdr pane identifier, such as w1:p2. */
  readonly pane: string;
  /** Herdr tab identifier that contains the pane. */
  readonly tab: string;
  /** Herdr workspace identifier that contains the tab. */
  readonly workspace: string;
}
