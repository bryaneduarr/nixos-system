import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { OFF_ACTION, ON_ACTION, STATUS_ACTION, TOGGLE_ACTION } from "../../constants/fast-mode/fast-mode.constant.ts";
import type { FastModeControls } from "../../types/fast-mode/fast-mode-controls.interface.ts";

const COMPLETED_ACTIONS: readonly string[] = [ON_ACTION, OFF_ACTION, TOGGLE_ACTION, STATUS_ACTION];
const CHANGE_ACTIONS: readonly string[] = [ON_ACTION, OFF_ACTION, TOGGLE_ACTION];

function showStatus(controls: FastModeControls, ctx: ExtensionContext): void {
  const fastState = controls.isEnabled() ? "on" : "off";
  const isCurrentModelSupported = ctx.model !== undefined && controls.isModelSupported(ctx.model);
  const supportText = isCurrentModelSupported
    ? "Current model supports priority."
    : "Current model does not support priority.";
  controls.updateStatus(ctx);
  ctx.ui.notify(`Fast mode is ${fastState}. ${supportText}`, "info");
}

export function registerFastCommand(pi: ExtensionAPI, controls: FastModeControls): void {
  pi.registerCommand("fast", {
    description: "Turn Codex fast mode on or off",
    getArgumentCompletions: (prefix) =>
      COMPLETED_ACTIONS.filter((action) => action.startsWith(prefix)).map((action) => ({
        value: action,
        label: action,
      })),
    handler: async (args, ctx) => {
      let action = args.trim().toLowerCase();

      if (!action && ctx.hasUI) {
        const selection = await ctx.ui.select("Codex fast mode", ["On", "Off"]);
        if (!selection) return;
        action = selection.toLowerCase();
      }

      if (!action || action === STATUS_ACTION) {
        showStatus(controls, ctx);
        return;
      }

      if (!CHANGE_ACTIONS.includes(action)) {
        ctx.ui.notify("Use /fast on, off, toggle, or status.", "warning");
        return;
      }

      const isToggleToOn = action === TOGGLE_ACTION && !controls.isEnabled();
      controls.setEnabled(action === ON_ACTION || isToggleToOn, ctx);
    },
  });
}
