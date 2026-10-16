/** Whether a tool call can be aborted by its caller. */
export type ToolCancellation = AbortableToolCall | UncancellableToolCall;

/** A tool call that stops when its abort signal fires. */
interface AbortableToolCall {
  /** Marks that the call has an abort signal. */
  readonly kind: "abortable";
  /** Signal that aborts the call. */
  readonly signal: AbortSignal;
}

/** A tool call with no abort signal. */
interface UncancellableToolCall {
  /** Marks that the call has no abort signal. */
  readonly kind: "uncancellable";
}
