import { TASK_TOOL_NAME } from "../../../constants/subagents/roles.constant.ts";
import { toValueState } from "../../activity/value/to-value-state.service.ts";
import { resolveTaskRole } from "../../subagents/roles/resolve-task-role.service.ts";
import { stringValues } from "./string-values.service.ts";

export function formatMissionInput(args: Record<string, unknown>): string {
  const selectedTools = stringValues(args.tools);
  const verificationCommands = stringValues(args.verificationCommands);
  let roleAndTools: string[];

  try {
    const resolved = resolveTaskRole({
      role: toValueState(args.role === undefined ? undefined : String(args.role)),
      tools: toValueState(selectedTools),
      verificationCommands: toValueState(verificationCommands),
    });
    const effectiveTools = resolved.tools.join(", ") || "none";
    roleAndTools = [`role: ${resolved.role}`, `effective tools: ${effectiveTools}`];
  } catch {
    const role = typeof args.role === "string" ? args.role : TASK_TOOL_NAME;
    const tools = selectedTools?.join(", ") ?? "invalid";
    roleAndTools = [`role: ${role}`, `tools: ${tools}`];
  }

  const lines = [`title: ${String(args.title ?? "")}`, ...roleAndTools, `mission: ${args.mission}`];

  if (typeof args.context === "string") {
    lines.push(`context: ${args.context}`);
  }

  if (verificationCommands?.length) {
    lines.push(`approved commands: ${verificationCommands.join("; ")}`);
  }

  const skills = Array.isArray(args.skills) ? args.skills.join(", ") : "none";
  lines.push(`skills: ${skills}`);

  if (typeof args.model === "string") lines.push(`model: ${args.model}`);
  if (typeof args.reasoning === "string") lines.push(`reasoning: ${args.reasoning}`);
  if (typeof args.timeoutMs === "number") lines.push(`timeout: ${args.timeoutMs} ms`);

  return lines.join("\n");
}
