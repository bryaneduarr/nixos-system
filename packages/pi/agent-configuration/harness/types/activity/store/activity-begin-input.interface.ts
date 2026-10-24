/** Fields that start recording a tool call. */
export interface ActivityBeginInput {
  /** Identifier of the tool call. */
  readonly id: string;
  /** Name of the tool that runs. */
  readonly toolName: string;
  /** Arguments the tool is called with. */
  readonly args: Readonly<Record<string, unknown>>;
  /** Working directory the call runs in. */
  readonly cwd: string;
  /** Start time of the call, in milliseconds since the epoch. */
  readonly startedAt: number;
}
