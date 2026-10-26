import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
  INPUT_CARD_RENDERER_KEY,
  MESSAGE_CARD_RENDERER_KEY,
} from "../../../constants/transcript/card/card-renderer-key.constant.ts";
import { TUI_MODE } from "../../../constants/ui-mode/tui-mode.constant.ts";
import { renderInputCard } from "./render-input-card.service.ts";
import { renderMessageCard } from "./render-message-card.service.ts";

export function installCardRenderers(pi: ExtensionAPI): void {
  pi.on("session_start", (_event, ctx) => {
    if (ctx.mode !== TUI_MODE) return;
    Reflect.set(globalThis, MESSAGE_CARD_RENDERER_KEY, renderMessageCard);
    Reflect.set(globalThis, INPUT_CARD_RENDERER_KEY, renderInputCard);
  });

  pi.on("session_shutdown", () => {
    Reflect.deleteProperty(globalThis, MESSAGE_CARD_RENDERER_KEY);
    Reflect.deleteProperty(globalThis, INPUT_CARD_RENDERER_KEY);
  });
}
