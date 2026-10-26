import type { ToolLoadout, ToolLoadoutChanges } from "@earendil-works/pi-coding-agent";
import { BACKEND_TOOLS } from "../../../constants/tools/backends/backend-tools.constant.ts";

const BACKEND_TOOL_NAMES: ReadonlySet<string> = new Set<string>(BACKEND_TOOLS);

export function hideBackendDeclarations(loadout: Pick<ToolLoadout, "declared">): ToolLoadoutChanges {
  const hiddenDeclarations = loadout.declared.map((tool) => tool.name).filter((name) => BACKEND_TOOL_NAMES.has(name));
  return { hiddenDeclarations };
}
