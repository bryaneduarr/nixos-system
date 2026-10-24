import { PromptBrowser } from "../../../components/prompts/prompt-browser.component.ts";
import {
  OVERLAY_ANCHOR,
  OVERLAY_MARGIN,
  OVERLAY_MAX_HEIGHT,
  OVERLAY_WIDTH,
} from "../../../constants/prompts/viewer.constant.ts";
import type { ClipboardWriter } from "../../../types/prompts/clipboard-writer.interface.ts";
import type { PromptCollections } from "../../../types/prompts/prompt-collections.interface.ts";
import type { PromptSelection } from "../../../types/prompts/prompt-selection.interface.ts";
import type { PromptViewerUi } from "../../../types/prompts/prompt-viewer-ui.interface.ts";

export async function viewPrompt(
  ui: PromptViewerUi,
  collections: PromptCollections,
  clipboard: ClipboardWriter,
  selection: PromptSelection,
): Promise<void> {
  await ui.custom<void>(
    (host, theme, _keybindings, done) => new PromptBrowser(collections, host, theme, done, clipboard, selection),
    {
      overlay: true,
      overlayOptions: {
        anchor: OVERLAY_ANCHOR,
        width: OVERLAY_WIDTH,
        maxHeight: OVERLAY_MAX_HEIGHT,
        margin: OVERLAY_MARGIN,
      },
    },
  );
}
