import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { API_ERROR_RENDERER_KEY } from "../../../constants/transcript/api-error-renderer.constant.ts";
import { API_ERROR_PREVIEW_TITLE } from "../../../constants/transcript/transcript-preview.constant.ts";
import { TUI_MODE } from "../../../constants/ui-mode/tui-mode.constant.ts";
import { previewLines } from "../preview/preview-lines.service.ts";

export function installApiErrorRenderer(pi: ExtensionAPI): void {
  pi.on("session_start", (_event, ctx) => {
    if (ctx.mode !== TUI_MODE) return;
    const renderApiError = (errorMessage: string, width: number): string[] =>
      previewLines(API_ERROR_PREVIEW_TITLE, errorMessage, width).map((line) => ctx.ui.theme.fg("error", line));
    Reflect.set(globalThis, API_ERROR_RENDERER_KEY, renderApiError);
  });

  pi.on("session_shutdown", () => {
    Reflect.deleteProperty(globalThis, API_ERROR_RENDERER_KEY);
  });
}
