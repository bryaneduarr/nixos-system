import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
  HARNESS_STATUS_COMMAND_NAME,
  HARNESS_STATUS_DESCRIPTION,
} from "../../constants/tools/active-tools/harness-status.constant.ts";
import { enforceActiveTools } from "../../services/tools/active-tools/enforce-active-tools.service.ts";
import { formatHarnessStatus } from "../../services/tools/active-tools/format-harness-status.service.ts";
import { writeStatusFile } from "../../services/tools/active-tools/write-status-file.service.ts";

export function registerHarnessStatusCommand(pi: ExtensionAPI): void {
  pi.registerCommand(HARNESS_STATUS_COMMAND_NAME, {
    description: HARNESS_STATUS_DESCRIPTION,
    handler: async (_args, ctx) => {
      enforceActiveTools(pi);
      await writeStatusFile(pi);
      const registeredToolNames = pi.getAllTools().map((tool) => tool.name);
      ctx.ui.notify(formatHarnessStatus(pi.getActiveTools(), registeredToolNames), "info");
    },
  });
}
