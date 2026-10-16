import { TOOL_TITLES } from "../../../constants/tool-rendering/tool-title.constant.ts";
import type {
  HarnessPresentation,
  HarnessVisualState,
} from "../../../types/tool-rendering/harness-presentation.interface.ts";
import type { HarnessTool } from "../../../types/tools/harness-tool.interface.ts";
import { errorDetail } from "../details/error-detail.service.ts";
import { successDetail } from "../details/success-detail.service.ts";
import { toolTarget } from "./tool-target.service.ts";

export function resultPresentation(
  tool: HarnessTool,
  args: Record<string, unknown>,
  text: string,
  state: HarnessVisualState,
): HarnessPresentation {
  const base = { title: TOOL_TITLES[tool], target: toolTarget(tool, args) };
  if (state === "running") return { ...base, state, details: [] };
  if (state === "error") return { ...base, state, details: errorDetail(tool, text) };
  return { ...base, state, details: successDetail(tool, text) };
}
