import { PromptBrowser } from "../../../components/prompts/prompt-browser.component.ts";
import {
  OVERLAY_ANCHOR,
  OVERLAY_MARGIN,
  OVERLAY_MAX_HEIGHT,
  OVERLAY_WIDTH,
} from "../../../constants/prompts/viewer.constant.ts";
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
    overlayOptions: {
      anchor: OVERLAY_ANCHOR,
      width: OVERLAY_WIDTH,
      maxHeight: OVERLAY_MAX_HEIGHT,
      margin: OVERLAY_MARGIN,
    },
  });
}
