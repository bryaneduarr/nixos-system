import { highlightBoldText } from "./highlight-bold-text.service.ts";
import { mapMarkdownProse } from "./map-markdown-prose.service.ts";

export function presentAssistantMarkdown(markdown: string): string {
  return mapMarkdownProse(markdown, highlightBoldText);
}
