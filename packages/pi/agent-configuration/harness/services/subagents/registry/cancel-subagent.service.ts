import {
  SUBAGENT_CANCELLED_MESSAGE,
  SUBAGENT_NOT_RUNNING_MESSAGE,
} from "../../../constants/subagents/registry/subagent-command.constant.ts";
import type { SubagentRegistry } from "../../../types/subagents/registry/subagent-registry.interface.ts";

export function cancelSubagent(registry: SubagentRegistry, id: string): string {
  return registry.cancel(id) ? SUBAGENT_CANCELLED_MESSAGE : SUBAGENT_NOT_RUNNING_MESSAGE;
}
