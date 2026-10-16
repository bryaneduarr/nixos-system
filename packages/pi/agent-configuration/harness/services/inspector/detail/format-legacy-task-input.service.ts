import { stringValues } from "./string-values.service.ts";

const TASK_DEFAULT_TOOLS = "search, read, run";

export function formatLegacyTaskInput(args: Record<string, unknown>): string {
  const prompt = typeof args.prompt === "string" ? args.prompt : "(empty)";
  const selectedTools = stringValues(args.tools) ?? [];
  const cwd = typeof args.cwd === "string" ? args.cwd : "";
  const toolList = selectedTools.length > 0 ? selectedTools.join(", ") : TASK_DEFAULT_TOOLS;
  const lines = ["instruction:", prompt, "", `tools: ${toolList}`];

  if (cwd) lines.push(`cwd: ${cwd}`);

  return lines.join("\n");
}
