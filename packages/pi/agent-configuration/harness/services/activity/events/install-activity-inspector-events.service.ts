import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { INSPECT_SHORTCUT } from "../../../constants/inspector/open/inspect-shortcut.constant.ts";
import { inspectRequestStore } from "../../../stores/inspector/inspect-request.store.ts";
import { openInspector } from "../../inspector/open/open-inspector.service.ts";

export function installActivityInspectorEvents(pi: ExtensionAPI, touch: (ctx: ExtensionContext) => void): void {
  inspectRequestStore.setOpener((ctx, selection) => {
    void openInspector(ctx, selection);
  });

  pi.registerShortcut(INSPECT_SHORTCUT, {
    description: "Inspect harness tool activity",
    handler: async (ctx) => {
      touch(ctx);
      await openInspector(ctx, { kind: "latest" });
    },
  });

  pi.registerCommand("activity", {
    description: "Inspect agent thinking, tool calls, source read, results, and delegation",
    handler: async (_args, ctx) => {
      touch(ctx);
      await openInspector(ctx, { kind: "latest" });
    },
  });
}
