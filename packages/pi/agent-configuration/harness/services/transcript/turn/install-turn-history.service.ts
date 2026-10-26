import {
  TURN_DIVIDER_RENDERER_KEY,
  TURN_HISTORY_TOGGLE_DESCRIPTION,
  TURN_HISTORY_TOGGLE_SHORTCUT,
} from "../../../constants/transcript/turn/turn-view.constant.ts";
import { TUI_MODE } from "../../../constants/ui-mode/tui-mode.constant.ts";
import { turnView } from "../../../stores/transcript/turn-view.store.ts";
import type { TurnDividerRequest } from "../../../types/transcript/turn/turn-divider.interface.ts";
import type { TurnHistoryApi } from "../../../types/transcript/turn/turn-history-api.interface.ts";
import { refreshTranscript } from "./refresh-transcript.service.ts";
import { renderTurnDivider } from "./render-turn-divider.service.ts";

export function installTurnHistory(pi: TurnHistoryApi): void {
  pi.on("session_start", (_event, ctx) => {
    if (ctx.mode !== TUI_MODE) return;
    turnView.reset();
    Reflect.set(globalThis, TURN_DIVIDER_RENDERER_KEY, (request: TurnDividerRequest) =>
      renderTurnDivider(ctx.ui.theme, request),
    );
  });

  pi.on("input", () => {
    turnView.reset();
    return { action: "continue" };
  });

  pi.on("session_shutdown", () => {
    Reflect.deleteProperty(globalThis, TURN_DIVIDER_RENDERER_KEY);
  });

  pi.registerShortcut(TURN_HISTORY_TOGGLE_SHORTCUT, {
    description: TURN_HISTORY_TOGGLE_DESCRIPTION,
    handler: (ctx) => {
      turnView.toggleHidden();
      refreshTranscript(ctx.ui, turnView.current().hidden ? "turn-start" : "keep-position");
    },
  });
}
