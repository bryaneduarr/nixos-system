/** Fields that decide whether a finished tool call failed. */
export interface ToolResultStatusInput {
  /** Name of the tool that ran. */
  readonly toolName: string;
  /** Model-visible result text of the tool call. */
  readonly text: string;
  /** Whether the runtime reported the tool call as an error. */
  readonly isError: boolean;
  /** Whether the result details describe a task that failed or was cancelled. */
  readonly taskFailed: boolean;
}
