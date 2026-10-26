import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { WARNING_RENDERER_KEY } from "../../../constants/transcript/warning-renderer.constant.ts";
import { TUI_MODE } from "../../../constants/ui-mode/tui-mode.constant.ts";
import { createWarningRendererFactory } from "./create-warning-renderer-factory.service.ts";

export function installWarningRenderer(pi: ExtensionAPI): void {
  pi.on("session_start", (_event, ctx) => {
    if (ctx.mode !== TUI_MODE) return;
    Reflect.set(globalThis, WARNING_RENDERER_KEY, createWarningRendererFactory(ctx.cwd, ctx.ui.theme));
  });

  pi.on("session_shutdown", () => {
    Reflect.deleteProperty(globalThis, WARNING_RENDERER_KEY);
  });
}
