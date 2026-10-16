import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { FastModeControls } from "../../../types/fast-mode/fast-mode-controls.interface.ts";

export function installFastModeEvents(pi: ExtensionAPI, controls: FastModeControls): void {
  pi.on("session_start", (_event, ctx) => controls.restore(ctx));
  pi.on("session_tree", (_event, ctx) => controls.updateStatus(ctx));
  pi.on("model_select", (_event, ctx) => controls.updateStatus(ctx));
}
