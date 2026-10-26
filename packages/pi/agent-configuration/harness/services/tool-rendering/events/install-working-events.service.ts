import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { TUI_MODE } from "../../../constants/ui-mode/tui-mode.constant.ts";

export function installWorkingEvents(pi: ExtensionAPI): void {
  pi.on("session_start", (_event, ctx) => {
    if (ctx.mode === TUI_MODE) {
      ctx.ui.setStatus("harness-session", undefined);
      ctx.ui.setWorkingVisible(false);
    }
  });

  pi.on("agent_start", (_event, ctx) => {
    if (ctx.mode === TUI_MODE) ctx.ui.setWorkingVisible(false);
  });
}
