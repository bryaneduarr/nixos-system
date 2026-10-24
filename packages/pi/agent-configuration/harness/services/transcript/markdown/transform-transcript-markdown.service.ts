import type { MarkdownTransformContext } from "@earendil-works/pi-coding-agent";
import { isRecordedApiErrorText } from "../../activity/messages/is-recorded-api-error-text.service.ts";
import { previewPrompt } from "../../prompts/preview/preview-prompt.service.ts";
import { thinkingPreviewMarkdown } from "../thinking/thinking-preview-markdown.service.ts";
import { presentAssistantMarkdown } from "./present-assistant-markdown.service.ts";

export function transformTranscriptMarkdown(markdown: string, context: MarkdownTransformContext): string {
  switch (context.messageType) {
    case "user":
      return previewPrompt(markdown, context.availableWidth);
    case "assistant-thinking":
      return thinkingPreviewMarkdown(markdown, context.availableWidth);
    case "assistant":
      // Some providers repeat the error as reply text; the API error preview already shows it.
      return isRecordedApiErrorText(markdown) ? "" : presentAssistantMarkdown(markdown);
    default: {
      const unhandledMessageType: never = context.messageType;
      return unhandledMessageType;
    }
  }
}
