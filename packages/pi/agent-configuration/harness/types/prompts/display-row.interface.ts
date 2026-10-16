/* One terminal cell of a wrapped prompt line. */
interface DisplayCell {
  /* Index of the grapheme the cell displays. */
  readonly index: number;
  /* Text drawn in the cell after unsafe characters are replaced. */
  readonly text: string;
  /* Terminal column where the cell starts. */
  readonly column: number;
  /* Terminal columns the cell occupies. */
  readonly width: number;
}

/* Cells of one wrapped terminal line of a prompt. */
export type DisplayRow = DisplayCell[];
