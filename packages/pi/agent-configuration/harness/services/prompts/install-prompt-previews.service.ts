import { copyToClipboard } from "@earendil-works/pi-coding-agent";
import { registerPromptsCommand } from "../../commands/prompts/prompts.command.ts";
import {
  PROMPT_BROWSER_DESCRIPTION,
  PROMPT_BROWSER_NO_PROMPTS_MESSAGE,
  PROMPT_BROWSER_SHORTCUT,
} from "../../constants/prompts/registration.constant.ts";
import type { PromptContext } from "../../types/prompts/prompt-context.interface.ts";
import type { PromptExtensionApi } from "../../types/prompts/prompt-extension-api.interface.ts";
import { collectPrompts } from "./collection/collect-prompts.service.ts";
import { previewPrompt } from "./preview/preview-prompt.service.ts";
import { viewPrompt } from "./view/view-prompt.service.ts";

export function installPromptPreviews(pi: PromptExtensionApi): void {
  pi.registerMarkdownTransformer((markdown, context) => {
    if (context.messageType !== "user") return markdown;
    return previewPrompt(markdown, context.availableWidth);
  });

  let browserOpen = false;

  const openPrompt = async (ctx: PromptContext): Promise<void> => {
    if (ctx.mode !== "tui" || browserOpen) return;
    const prompts = collectPrompts(ctx.sessionManager.getBranch(), ctx.ui.getEditorText());
    if (prompts.length === 0) {
      ctx.ui.notify(PROMPT_BROWSER_NO_PROMPTS_MESSAGE, "info");
      return;
    }
    browserOpen = true;
    try {
      await viewPrompt(ctx.ui, prompts, copyToClipboard);
    } finally {
      browserOpen = false;
    }
  };

  pi.registerShortcut(PROMPT_BROWSER_SHORTCUT, {
    description: PROMPT_BROWSER_DESCRIPTION,
    handler: openPrompt,
  });
  registerPromptsCommand(pi, openPrompt);
}
