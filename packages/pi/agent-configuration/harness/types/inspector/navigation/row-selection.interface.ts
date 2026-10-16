/** No tool list row is selected because the list is empty. */
interface NoRowSelection {
  /** Discriminates the absence of a selected row. */
  readonly kind: "none";
}

/** A tool list row is selected by its key. */
interface SelectedRow {
  /** Discriminates a selected row. */
  readonly kind: "row";
  /** Key of the selected row: an entry id, or entry id and child call id joined by a separator. */
  readonly id: string;
}

/** Tool list row selection state. */
export type RowSelection = NoRowSelection | SelectedRow;
