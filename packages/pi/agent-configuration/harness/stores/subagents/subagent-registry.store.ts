import { createSubagentRegistry } from "../../services/subagents/registry/create-subagent-registry.service.ts";
import type { SubagentRegistry } from "../../types/subagents/registry/subagent-registry.interface.ts";

export const subagentRegistry: SubagentRegistry = createSubagentRegistry();
