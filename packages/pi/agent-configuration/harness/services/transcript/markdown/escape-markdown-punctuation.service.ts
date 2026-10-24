// Escapes Markdown syntax except "(", ")" and "[", which pi-tui reads as LaTeX delimiters once escaped.
const MARKDOWN_PUNCTUATION_PATTERN = /[!-'*-/:-@\\\]-`{-~]/g;

export function escapeMarkdownPunctuation(text: string): string {
  return text.replace(MARKDOWN_PUNCTUATION_PATTERN, (character) => `\\${character}`);
}
