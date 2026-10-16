/* Fields that start recording a tool call. */
export interface ActivityBeginInput {
  /* Identifier of the tool call. */
  id: string;
  /* Name of the tool that runs. */
  toolName: string;
  /* Arguments the tool is called with. */
  args: Record<string, unknown>;
  /* Working directory the call runs in. */
  cwd: string;
  /* Start time of the call, defaulting to now. */
  startedAt?: number;
}
