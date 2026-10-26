import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
  SUBAGENT_STATUS_COMMAND_NAME,
  SUBAGENT_STATUS_DESCRIPTION,
} from "../../constants/subagents/registry/subagent-command.constant.ts";
import { formatSubagentRuns } from "../../services/subagents/registry/format-subagent-runs.service.ts";
import { selectSubagentRuns } from "../../services/subagents/registry/select-subagent-runs.service.ts";
import { subagentRegistry } from "../../stores/subagents/subagent-registry.store.ts";

export function registerSubagentStatusCommand(pi: ExtensionAPI): void {
  pi.registerCommand(SUBAGENT_STATUS_COMMAND_NAME, {
    description: SUBAGENT_STATUS_DESCRIPTION,
    handler: async (args, ctx) => {
      const runs = selectSubagentRuns(subagentRegistry, args.trim());
      ctx.ui.notify(formatSubagentRuns(runs), "info");
    },
  });
}
