import { PROMPT_BROWSER_COMMAND, PROMPT_BROWSER_DESCRIPTION } from "../../constants/prompts/registration.constant.ts";
import type { PromptContext } from "../../types/prompts/install/prompt-context.interface.ts";
import type { PromptExtensionApi } from "../../types/prompts/install/prompt-extension-api.interface.ts";

export function registerPromptsCommand(
  pi: PromptExtensionApi,
  openPrompt: (ctx: PromptContext) => Promise<void>,
): void {
  pi.registerCommand(PROMPT_BROWSER_COMMAND, {
    description: PROMPT_BROWSER_DESCRIPTION,
    handler: (_args, ctx) => openPrompt(ctx),
  });
}
