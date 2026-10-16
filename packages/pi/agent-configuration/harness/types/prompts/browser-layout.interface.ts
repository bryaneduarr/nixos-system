/* Terminal rows and columns the prompt browser uses for its panes. */
export interface BrowserLayout {
  /* Total rows of the browser including its frame. */
  readonly height: number;
  /* Columns inside the frame. */
  readonly inner: number;
  /* Rows available for pane content between the heading and the footer. */
  readonly body: number;
  /* Whether the list stacks above the detail pane. */
  readonly stacked: boolean;
  /* Columns of the list pane. */
  readonly listWidth: number;
  /* Rows of the list pane. */
  readonly listHeight: number;
  /* Columns of the detail pane. */
  readonly detailWidth: number;
  /* Wrapped detail rows shown at once. */
  readonly pageSize: number;
}
