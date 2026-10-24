/** Edit parameters that cannot form a request. */
export interface InvalidEditRequest {
  /** Marks an unusable request. */
  readonly valid: false;
  /** Message to return to the model. */
  readonly summary: string;
}
