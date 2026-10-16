import {
  MESSAGE_ACTIVITY_NAME,
  THINKING_ACTIVITY_NAME,
  UPDATE_ACTIVITY_NAME,
} from "../../../constants/activity/activity-entry.constant.ts";
import { TASK_TOOL_NAME } from "../../../constants/subagents/roles.constant.ts";
import { toolTarget } from "../../tool-rendering/presentation/tool-target.service.ts";
import { isHarnessTool } from "../../tools/is-harness-tool.service.ts";
import { formatValue } from "../detail/format-value.service.ts";
import { oneSentence } from "./one-sentence.service.ts";

export function toolTargetLabel(tool: string, args: Record<string, unknown>, text: string): string {
  if (tool === TASK_TOOL_NAME && typeof args.title === "string") return args.title;
  if (isHarnessTool(tool)) return toolTarget(tool, args);
  if (tool === MESSAGE_ACTIVITY_NAME || tool === THINKING_ACTIVITY_NAME || tool === UPDATE_ACTIVITY_NAME) {
    return oneSentence(text);
  }

  return oneSentence(formatValue(args));
}
