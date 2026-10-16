import { PromptBrowser } from "../../../components/prompts/prompt-browser.component.ts";
import type { ClipboardWriter } from "../../../types/prompts/clipboard-writer.interface.ts";
import type { PromptItem } from "../../../types/prompts/prompt-item.interface.ts";
import type { PromptViewerUi } from "../../../types/prompts/prompt-viewer-ui.interface.ts";

export async function viewPrompt(
  ui: PromptViewerUi,
  prompts: readonly PromptItem[],
  clipboard: ClipboardWriter,
): Promise<void> {
  await ui.custom<void>((host, theme, _keybindings, done) => new PromptBrowser(prompts, host, theme, done, clipboard), {
    overlay: true,
    overlayOptions: { anchor: "center", width: "92%", maxHeight: "88%", margin: 1 },
  });
}
