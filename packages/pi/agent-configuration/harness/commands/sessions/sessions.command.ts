import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

export function installSessionsCommand(pi: ExtensionAPI, show: (ctx: ExtensionContext) => Promise<void>): void {
  pi.registerShortcut("ctrl+alt+s", { description: "Manage live Pi sessions", handler: show });
  pi.registerCommand("sessions", { description: "Manage live Pi sessions", handler: async (_args, ctx) => show(ctx) });
}
