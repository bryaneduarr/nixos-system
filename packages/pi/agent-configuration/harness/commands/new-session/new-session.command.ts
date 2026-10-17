import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

export function installNewSessionCommand(pi: ExtensionAPI, createHere: (ctx: ExtensionContext) => Promise<void>): void {
  pi.registerShortcut("ctrl+alt+n", {
    description: "Start Pi in a sibling pane for the current project",
    handler: createHere,
  });
}
