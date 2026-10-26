import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { registerFastCommand } from "./commands/fast/fast.command.ts";
import { CODEX_RESPONSES_API } from "./constants/codex/codex.constant.ts";
import { FAST_MODE_ENTRY_TYPE } from "./constants/fast-mode/fast-mode.constant.ts";
import { loadFastModels } from "./services/codex-models/load-fast-models.service.ts";
import { supportsFastMode } from "./services/codex-models/supports-fast-mode.service.ts";
import { installFastModeEvents } from "./services/fast-mode/events/install-fast-mode-events.service.ts";
import { readFastModePreference } from "./services/fast-mode/preference/read-fast-mode-preference.service.ts";
import { saveFastModePreference } from "./services/fast-mode/preference/save-fast-mode-preference.service.ts";
import { resolveFastModeEnabled } from "./services/fast-mode/resolve-fast-mode-enabled.service.ts";
import { streamWithFastMode } from "./services/fast-mode/stream-with-fast-mode.service.ts";
import { updateFastModeStatus } from "./services/fast-mode/update-fast-mode-status.service.ts";
import type { FastModeControls } from "./types/fast-mode/fast-mode-controls.interface.ts";

export default function codexFastMode(pi: ExtensionAPI): void {
  let enabled = false;
  let fastModels = loadFastModels();

  function updateStatus(ctx: ExtensionContext): void {
    updateFastModeStatus(ctx, enabled, fastModels);
  }

  pi.registerProvider("harness-codex-fast", {
    api: CODEX_RESPONSES_API,
    streamSimple: (model, context, options) =>
      streamWithFastMode({
        model,
        context,
        options,
        isFastModeActive: enabled && supportsFastMode(model, fastModels),
      }),
  });

  function restore(ctx: ExtensionContext): void {
    enabled = resolveFastModeEnabled(ctx, readFastModePreference());
    fastModels = loadFastModels();
    updateStatus(ctx);
  }

  function setEnabled(nextEnabled: boolean, ctx: ExtensionContext): void {
    const isCurrentModelSupported = ctx.model !== undefined && supportsFastMode(ctx.model, fastModels);
    if (nextEnabled && !isCurrentModelSupported) {
      ctx.ui.notify("Fast mode is unavailable for this model. Select a supported openai-codex model first.", "warning");
      return;
    }

    try {
      saveFastModePreference(nextEnabled);
    } catch {
      ctx.ui.notify("Could not save the fast-mode preference. Fast mode was not changed.", "error");
      return;
    }

    enabled = nextEnabled;
    pi.appendEntry(FAST_MODE_ENTRY_TYPE, { enabled });
    updateStatus(ctx);
  }

  const controls: FastModeControls = {
    isEnabled: () => enabled,
    isModelSupported: (model) => supportsFastMode(model, fastModels),
    setEnabled,
    updateStatus,
    restore,
  };

  installFastModeEvents(pi, controls);

  pi.registerShortcut("ctrl+alt+f", {
    description: "Toggle Codex fast mode",
    handler: async (ctx) => setEnabled(!enabled, ctx),
  });

  registerFastCommand(pi, controls);
}
