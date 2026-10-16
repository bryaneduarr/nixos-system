import type { HarnessTool } from "../../../types/tools/harness-tool.interface.ts";
import { firstLine } from "../text/first-line.service.ts";
import { oneLine } from "../text/one-line.service.ts";
import { runDetail } from "./run-detail.service.ts";

export function errorDetail(tool: HarnessTool, text: string): string[] {
  if (tool === "run") return [runDetail(text)];
  const line = firstLine(text);
  return [line ? oneLine(line) : "error"];
}
