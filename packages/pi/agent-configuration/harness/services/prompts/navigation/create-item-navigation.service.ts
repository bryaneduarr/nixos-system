import { EMPTY_PROMPT_TEXT } from "../../../constants/prompts/text.constant.ts";
import type { PromptItem } from "../../../types/prompts/collection/prompt-item.interface.ts";
import type { PromptNavigation } from "../../../types/prompts/navigation/prompt-navigation.interface.ts";
import { createPromptNavigation } from "./create-prompt-navigation.service.ts";

export function createItemNavigation(items: readonly PromptItem[], index: number): PromptNavigation {
  const item = items[index];
  if (item === undefined) return createPromptNavigation(EMPTY_PROMPT_TEXT);
  return createPromptNavigation(item.text);
}
