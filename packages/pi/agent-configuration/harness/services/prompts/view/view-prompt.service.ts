import { PromptBrowser } from "../../../components/prompts/prompt-browser.component.ts";
import {
  OVERLAY_ANCHOR,
  OVERLAY_MARGIN,
  OVERLAY_MAX_HEIGHT,
  OVERLAY_WIDTH,
} from "../../../constants/split-view/overlay.constant.ts";
import type { ViewPromptRequest } from "../../../types/prompts/view/view-prompt-request.interface.ts";

export async function viewPrompt({ ui, collections, clipboard, selection }: ViewPromptRequest): Promise<void> {
  await ui.custom<void>(
    (host, theme, _keybindings, done) => new PromptBrowser({ collections, host, theme, done, clipboard, selection }),
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
