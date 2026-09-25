import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function clearExtension(pi: ExtensionAPI): void {
  pi.registerCommand("clear", {
    description: "Clear the screen and start a new empty session",
    handler: async (_arguments, context): Promise<void> => {
      // session_before_switch saves the current model, and the new runtime
      // restores it on session_start. The old pi and context expire here.
      await context.newSession();
    },
  });
}
