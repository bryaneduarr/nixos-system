import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/** Keep Pi's loader row hidden; the activity widget shows progress above the editor. */
export function installWorking(pi: ExtensionAPI): void {
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
