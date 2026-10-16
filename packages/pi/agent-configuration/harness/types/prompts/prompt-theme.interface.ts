/** Colors the prompt browser applies to its text. */
export interface PromptTheme {
  /** Applies a foreground color to text. */
  fg(color: string, text: string): string;
  /** Applies a background color to text. */
  bg(color: string, text: string): string;
}
