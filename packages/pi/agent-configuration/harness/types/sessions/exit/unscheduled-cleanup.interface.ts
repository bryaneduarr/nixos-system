/** No cleanup worker is scheduled. */
export interface UnscheduledCleanup {
  /** Marks that no cleanup worker is scheduled. */
  readonly scheduled: false;
}
