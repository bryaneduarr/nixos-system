import type { CopyPromptTextInput } from "../../../types/prompts/input/copy-prompt-text-input.interface.ts";
import { isSameSelectionAnchor } from "../navigation/is-same-selection-anchor.service.ts";

export async function copyPromptText({ text, clipboard, currentNavigation }: CopyPromptTextInput): Promise<string> {
  const navigation = currentNavigation();
  const anchor = navigation.anchor;
  const cursor = navigation.cursor;
  try {
    await clipboard(text);
  } catch {
    return "Copy failed";
  }
  const isSelectionUnchangedSinceCopy =
    currentNavigation() === navigation &&
    isSameSelectionAnchor(navigation.anchor, anchor) &&
    navigation.cursor === cursor;
  if (isSelectionUnchangedSinceCopy) navigation.anchor = { found: false };
  return `Copied ${text.length} characters`;
}
