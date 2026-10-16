import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { HARNESS_TOOLS } from "../../constants/tools/harness-tools.constant.ts";
import { enforceActiveTools } from "../../services/tools/enforce-active-tools.service.ts";
import { writeStatusFile } from "../../services/tools/write-status-file.service.ts";

export function registerHarnessStatusCommand(pi: ExtensionAPI): void {
  pi.registerCommand("harness-status", {
    description: "Show the active harness tools",
    handler: async (_args, ctx) => {
      enforceActiveTools(pi);
      await writeStatusFile(pi);
      const active = pi.getActiveTools();
      const all = pi.getAllTools().map((tool) => tool.name);
      ctx.ui.notify(
        `active: ${active.join(", ")}\nregistered: ${all.join(", ")}\nharness: ${HARNESS_TOOLS.join(", ")}`,
        "info",
      );
    },
  });
}
