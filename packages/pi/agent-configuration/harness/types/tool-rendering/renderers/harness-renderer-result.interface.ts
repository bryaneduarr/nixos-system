/** Tool result passed to a harness renderer; blocks are validated when read. */
export interface HarnessRendererResult {
  /** Raw content blocks of the tool result. */
  readonly content: readonly unknown[];
}
