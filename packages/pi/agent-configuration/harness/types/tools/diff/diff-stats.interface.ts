/** Count of lines added and removed by a change. */
export interface DiffStats {
  /** Lines added. */
  readonly added: number;
  /** Lines removed. */
  readonly removed: number;
}
