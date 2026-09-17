import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function clearExtension(pi: ExtensionAPI): void {
  pi.registerCommand("clear", {
    description: "Clear the screen and start a new empty session",
    handler: async (_arguments, context): Promise<void> => {
      await context.newSession();
    },
  });
}
