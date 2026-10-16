import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { subagentRegistry } from "../../services/subagents/registry/shared-subagent-registry.service.ts";

export function registerSubagentCancelCommand(pi: ExtensionAPI): void {
  pi.registerCommand("subagent-cancel", {
    description: "Cancel an active subagent by ID",
    handler: async (args, ctx) => {
      const cancelled = subagentRegistry.cancel(args.trim());
      const status = cancelled ? "Subagent cancellation requested." : "No running subagent with that ID.";
      ctx.ui.notify(status, "info");
    },
  });
}
