import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { installActivityEvents } from "../activity/events/install-activity-events.service.ts";
import { installPromptPreviews } from "../prompts/install/install-prompt-previews.service.ts";
import { installApiErrorRenderer } from "../transcript/api-error/install-api-error-renderer.service.ts";
import { installCardRenderers } from "../transcript/card/install-card-renderers.service.ts";
import { transformTranscriptMarkdown } from "../transcript/markdown/transform-transcript-markdown.service.ts";
import { installThinkingBoxRenderer } from "../transcript/thinking/install-thinking-box-renderer.service.ts";
import { installTurnHistory } from "../transcript/turn/install-turn-history.service.ts";
import { installWarningRenderer } from "../transcript/warning/install-warning-renderer.service.ts";
import { installCodemodeRenderer } from "./codemode/renderers/install-codemode-renderer.service.ts";
import { installWorkingEvents } from "./events/install-working-events.service.ts";

export function installHarnessPresentation(pi: ExtensionAPI): void {
  installActivityEvents(pi);
  installWorkingEvents(pi);
  installPromptPreviews(pi);
  installTurnHistory(pi);
  // Pi keeps one Markdown transformer per extension; a second registration replaces the first.
  pi.registerMarkdownTransformer(transformTranscriptMarkdown);
  installApiErrorRenderer(pi);
  installCardRenderers(pi);
  installThinkingBoxRenderer(pi);
  installWarningRenderer(pi);
  installCodemodeRenderer(pi);
}
