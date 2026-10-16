import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export function installWorkingEvents(pi: ExtensionAPI): void {
  pi.on("session_start", (_event, ctx) => {
    if (ctx.mode === "tui") {
      ctx.ui.setStatus("harness-session", undefined);
      ctx.ui.setWorkingVisible(false);
    }
  });

  pi.on("agent_start", (_event, ctx) => {
    if (ctx.mode === "tui") ctx.ui.setWorkingVisible(false);
  });
}
