import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { HARNESS_TOOLS } from "../../constants/tools/active-tools/harness-tools.constant.ts";
import { enforceActiveTools } from "../../services/tools/active-tools/enforce-active-tools.service.ts";
import { writeStatusFile } from "../../services/tools/active-tools/write-status-file.service.ts";

export function registerHarnessStatusCommand(pi: ExtensionAPI): void {
  pi.registerCommand("harness-status", {
    description: "Show the active harness tools",
    handler: async (_args, ctx) => {
      enforceActiveTools(pi);
      await writeStatusFile(pi);
      const activeToolNames = pi.getActiveTools();
      const registeredToolNames = pi.getAllTools().map((tool) => tool.name);
      ctx.ui.notify(
        `active: ${activeToolNames.join(", ")}\nregistered: ${registeredToolNames.join(", ")}\nharness: ${HARNESS_TOOLS.join(", ")}`,
        "info",
      );
    },
  });
}
