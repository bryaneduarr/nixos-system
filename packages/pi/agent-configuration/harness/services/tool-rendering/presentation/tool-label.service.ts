import { TOOL_TITLES } from "../../../constants/tool-rendering/tool-title.constant.ts";
import { isHarnessTool } from "../../tools/is-harness-tool.service.ts";

export function toolLabel(name: string): string {
  return isHarnessTool(name) ? TOOL_TITLES[name] : name.toUpperCase();
}
