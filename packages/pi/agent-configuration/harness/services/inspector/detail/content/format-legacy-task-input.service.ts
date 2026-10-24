import { EMPTY_TEXT_LABEL } from "../../../../constants/inspector/detail/label.constant.ts";
import { readStringList } from "./read-string-list.service.ts";

const TASK_DEFAULT_TOOLS = "search, read, run";

export function formatLegacyTaskInput(args: Record<string, unknown>): string {
  const prompt = typeof args.prompt === "string" ? args.prompt : EMPTY_TEXT_LABEL;
  const selectedTools = readStringList(args.tools);
  const toolList =
    selectedTools.state === "present" && selectedTools.value.length > 0
      ? selectedTools.value.join(", ")
      : TASK_DEFAULT_TOOLS;
  const cwd = typeof args.cwd === "string" ? args.cwd : "";
  const lines = ["instruction:", prompt, "", `tools: ${toolList}`];

  if (cwd) lines.push(`cwd: ${cwd}`);

  return lines.join("\n");
}
