import { escapeMarkdownPunctuation } from "../markdown/escape-markdown-punctuation.service.ts";
import { previewTextLines } from "../preview/preview-text-lines.service.ts";

export function thinkingPreviewMarkdown(thinking: string, availableWidth: number): string {
  return previewTextLines(thinking, availableWidth).map(escapeMarkdownPunctuation).join("\n");
}
