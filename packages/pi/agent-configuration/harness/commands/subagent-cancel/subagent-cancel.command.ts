import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
  SUBAGENT_CANCEL_COMMAND_NAME,
  SUBAGENT_CANCEL_DESCRIPTION,
} from "../../constants/subagents/registry/subagent-command.constant.ts";
import { cancelSubagent } from "../../services/subagents/registry/cancel-subagent.service.ts";
import { subagentRegistry } from "../../stores/subagents/subagent-registry.store.ts";

export function registerSubagentCancelCommand(pi: ExtensionAPI): void {
  pi.registerCommand(SUBAGENT_CANCEL_COMMAND_NAME, {
    description: SUBAGENT_CANCEL_DESCRIPTION,
    handler: async (args, ctx) => {
      ctx.ui.notify(cancelSubagent(subagentRegistry, args.trim()), "info");
    },
  });
}
