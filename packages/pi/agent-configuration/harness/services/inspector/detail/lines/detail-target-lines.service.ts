import { TASK_TOOL_NAME } from "../../../../constants/subagents/roles/roles.constant.ts";
import type { DetailLine } from "../../../../types/inspector/detail/detail-line.interface.ts";
import type { DetailTargetOptions } from "../../../../types/inspector/detail/detail-target-options.interface.ts";
import { harnessToolTarget } from "../../../tool-rendering/labels/harness-tool-target.service.ts";
import { isHarnessTool } from "../../../tools/active-tools/is-harness-tool.service.ts";

export function detailTargetLines({ tool, args, isChildCall, color }: DetailTargetOptions): DetailLine[] {
  if (tool === TASK_TOOL_NAME && !isChildCall) return [];
  const target = isHarnessTool(tool) ? harnessToolTarget(tool, args) : tool;
  return [{ text: target, color, bold: true }];
}
