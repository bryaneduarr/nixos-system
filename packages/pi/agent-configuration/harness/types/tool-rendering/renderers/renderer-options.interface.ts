/** Display options Pi passes with a tool result. */
export interface RendererOptions {
  /** Whether the result view is expanded. */
  readonly expanded: boolean;
  /** Whether this is a partial or streaming result. */
  readonly isPartial: boolean;
}
