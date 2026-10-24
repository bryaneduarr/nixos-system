import { HARNESS_TOOLS } from "../../../constants/tools/active-tools/harness-tools.constant.ts";
import type { HarnessTool } from "../../../types/tools/active-tools/harness-tool.interface.ts";

const HARNESS_TOOL_NAMES: ReadonlySet<string> = new Set<string>(HARNESS_TOOLS);

export function isHarnessTool(name: string): name is HarnessTool {
  return HARNESS_TOOL_NAMES.has(name);
}
