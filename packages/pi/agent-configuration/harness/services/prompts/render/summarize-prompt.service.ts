import { WHITESPACE_RUN_PATTERN } from "../../../constants/prompts/text.constant.ts";
import type { PromptItem } from "../../../types/prompts/collection/prompt-item.interface.ts";
import { safeDisplay } from "../display/safe-display.service.ts";

export function summarizePrompt(prompt: PromptItem): string {
  return safeDisplay(`${prompt.label} ${prompt.text.replace(WHITESPACE_RUN_PATTERN, " ")}`);
}
