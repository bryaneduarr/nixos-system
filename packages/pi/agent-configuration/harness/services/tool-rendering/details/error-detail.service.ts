import { ERROR_DETAIL_FALLBACK } from "../../../constants/tool-rendering/presentation/presentation-label.constant.ts";
import { RUN_TOOL_NAME } from "../../../constants/tools/active-tools/harness-tools.constant.ts";
import type { HarnessTool } from "../../../types/tools/active-tools/harness-tool.interface.ts";
import { firstLine } from "../text/first-line.service.ts";
import { oneLine } from "../text/one-line.service.ts";
import { runDetail } from "./run-detail.service.ts";

export function errorDetail(tool: HarnessTool, text: string): string[] {
  if (tool === RUN_TOOL_NAME && text.startsWith("exit:")) return [runDetail(text)];
  const line = firstLine(text);
  return [line ? oneLine(line) : ERROR_DETAIL_FALLBACK];
}
