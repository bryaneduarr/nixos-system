import { INVALID_LIST_LABEL, NONE_LABEL } from "../../../../constants/inspector/label.constant.ts";
import { TASK_TOOL_NAME } from "../../../../constants/subagents/roles.constant.ts";
import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";
import { toValueState } from "../../../activity/value/to-value-state.service.ts";
import { resolveTaskRole } from "../../../subagents/roles/resolve-task-role.service.ts";
import { readStringList } from "./read-string-list.service.ts";

function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function roleAndToolLines(
  args: Record<string, unknown>,
  selectedTools: ValueState<string[]>,
  verificationCommands: ValueState<string[]>,
): string[] {
  try {
    const resolved = resolveTaskRole({
      role: toValueState(args.role === undefined ? undefined : String(args.role)),
      tools: selectedTools,
      verificationCommands,
    });
    const effectiveTools = resolved.tools.join(", ") || NONE_LABEL;
    return [`role: ${resolved.role}`, `effective tools: ${effectiveTools}`];
  } catch {
    const role = typeof args.role === "string" ? args.role : TASK_TOOL_NAME;
    const tools = selectedTools.state === "present" ? selectedTools.value.join(", ") : INVALID_LIST_LABEL;
    return [`role: ${role}`, `tools: ${tools}`];
  }
}

export function formatMissionInput(args: Record<string, unknown>): string {
  const selectedTools = readStringList(args.tools);
  const verificationCommands = readStringList(args.verificationCommands);
  const lines = [
    `title: ${String(args.title ?? "")}`,
    ...roleAndToolLines(args, selectedTools, verificationCommands),
    `mission: ${args.mission}`,
  ];

  if (typeof args.context === "string") {
    lines.push(`context: ${args.context}`);
  }

  if (verificationCommands.state === "present" && verificationCommands.value.length > 0) {
    lines.push(`approved commands: ${verificationCommands.value.join("; ")}`);
  }

  const skills = isUnknownArray(args.skills) ? args.skills.join(", ") : NONE_LABEL;
  lines.push(`skills: ${skills}`);

  if (typeof args.model === "string") lines.push(`model: ${args.model}`);
  if (typeof args.reasoning === "string") lines.push(`reasoning: ${args.reasoning}`);
  if (typeof args.timeoutMs === "number") lines.push(`timeout: ${args.timeoutMs} ms`);

  return lines.join("\n");
}
