import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { rainbow } from "pi-powerline-footer/theme.ts";
import { FAST_MODE_STATUS_KEY } from "../../constants/fast-mode/fast-mode.constant.ts";
import { supportsFastMode } from "../codex-models/supports-fast-mode.service.ts";

const fastLabel = rainbow("fast");

export function updateFastModeStatus(ctx: ExtensionContext, enabled: boolean, fastModels: Set<string>): void {
  if (!ctx.hasUI) return;
  const isCurrentModelSupported = ctx.model !== undefined && supportsFastMode(ctx.model, fastModels);
  const isFastActive = enabled && isCurrentModelSupported;
  ctx.ui.setStatus(FAST_MODE_STATUS_KEY, isFastActive ? fastLabel : undefined);
}
