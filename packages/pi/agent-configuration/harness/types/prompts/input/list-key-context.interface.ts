/** What the list pane of the prompt browser needs to react to a key. */
export interface ListKeyContext {
  /** Index of the selected item. */
  readonly selected: number;
  /** Selects the item at the index. */
  select(index: number): void;
}
