import { TASK_TOOL_NAME } from "../../../../constants/subagents/roles.constant.ts";
import { toolTarget } from "../../../tool-rendering/labels/tool-target.service.ts";
import { isHarnessTool } from "../../../tools/active-tools/is-harness-tool.service.ts";
import { formatValue } from "../../detail/content/format-value.service.ts";
import { isPseudoEntryTool } from "../../entries/is-pseudo-entry-tool.service.ts";
import { oneSentence } from "./one-sentence.service.ts";

export function toolTargetLabel(tool: string, args: Record<string, unknown>, text: string): string {
  if (tool === TASK_TOOL_NAME && typeof args.title === "string") return args.title;
  if (isHarnessTool(tool)) return toolTarget(tool, args);
  if (isPseudoEntryTool(tool)) return oneSentence(text);

  return oneSentence(formatValue(args));
}
