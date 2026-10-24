/** What the list scroll position depends on for one frame. */
export interface ListScrollRequest {
  /** First visible row of the previous frame. */
  readonly previous: number;
  /** Number of rows in the list. */
  readonly length: number;
  /** Number of rows the list shows at once. */
  readonly height: number;
  /** Index of the selected row. */
  readonly selected: number;
}
