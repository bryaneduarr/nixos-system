import { TOOL_TITLES } from "../../../constants/tool-rendering/labels/tool-title.constant.ts";
import { isHarnessTool } from "../../tools/active-tools/is-harness-tool.service.ts";

export function toolLabel(name: string): string {
  return isHarnessTool(name) ? TOOL_TITLES[name] : name.toUpperCase();
}
