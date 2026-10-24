/** A terminal panel that renders itself and receives keyboard input. */
export interface PromptPanel {
  /** Renders the panel into lines for the given width. */
  render(width: number): string[];
  /** Drops cached render output. */
  invalidate(): void;
  /** Handles one keyboard input sequence. */
  handleInput(data: string): void;
}
