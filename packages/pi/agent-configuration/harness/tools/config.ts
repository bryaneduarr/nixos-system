import { HARNESS_TOOLS } from "../constants/tools/harness-tools.constant.ts";
import type { HarnessTool } from "../types/tools/harness-tool.interface.ts";

const HARNESS_TOOL_NAMES: ReadonlySet<string> = new Set<string>(HARNESS_TOOLS);

export function isHarnessTool(name: string): name is HarnessTool {
  return HARNESS_TOOL_NAMES.has(name);
}
