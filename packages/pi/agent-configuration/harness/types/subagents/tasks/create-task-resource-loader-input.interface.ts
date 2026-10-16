/** Inputs that build the resource loader of a worker session. */
export interface CreateTaskResourceLoaderInput {
  /** Working directory of the worker. */
  readonly cwd: string;
  /** System prompt of the worker. */
  readonly systemPrompt: string;
  /** Names of the discoverable skills the worker may read. */
  readonly skillNames: readonly string[];
}
