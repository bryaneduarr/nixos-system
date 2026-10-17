/** Runs implementation operations one at a time, in the order they were queued. */
export interface ImplementationQueue {
  /** Runs the operation after every earlier queued operation has settled. */
  run<T>(operation: () => Promise<T>): Promise<T>;
}
