import type { SubagentRegistry } from "../../../types/subagents/registry/subagent-registry.interface.ts";
import { createSubagentRegistry } from "./create-subagent-registry.service.ts";

export const subagentRegistry: SubagentRegistry = createSubagentRegistry();
