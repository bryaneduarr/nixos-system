/** One row of a rule file's exceptions table before validation. */
export interface ExceptionsTableRow {
  /** Text of the file column. */
  readonly file: string;
  /** Text of the rule column. */
  readonly rule: string;
  /** Text of the reason column. */
  readonly reason: string;
}
