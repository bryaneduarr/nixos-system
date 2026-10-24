/** A numbered page link in the footer of a split view. */
export interface SplitViewFooterLink {
  /** Number key that opens the page. */
  readonly key: string;
  /** Label of the page. */
  readonly name: string;
  /** Whether the page is shown now. */
  readonly active: boolean;
}
