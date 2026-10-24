import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { THINKING_BOX_RENDERER_KEY } from "../../../constants/transcript/thinking-box.constant.ts";
import { TUI_MODE } from "../../../constants/ui-mode/tui-mode.constant.ts";
import { renderMessageCard } from "../card/render-message-card.service.ts";

export function installThinkingBoxRenderer(pi: ExtensionAPI): void {
  pi.on("session_start", (_event, ctx) => {
    if (ctx.mode !== TUI_MODE) return;
    Reflect.set(
      globalThis,
      THINKING_BOX_RENDERER_KEY,
      (width: number, renderContent: (contentWidth: number) => string[]) =>
        renderMessageCard("thinking", width, renderContent),
    );
  });

  pi.on("session_shutdown", () => {
    Reflect.deleteProperty(globalThis, THINKING_BOX_RENDERER_KEY);
  });
}
