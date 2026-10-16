import { Value } from "typebox/value";
import { FailedTaskDetailsSchema } from "../schemas/subagents/result/failed-task-details.schema.ts";
import type { ParsedTaskOutput } from "../types/subagents/result/parsed-task-output.interface.ts";

const RESULT_SECTIONS = "status|summary|findings|unresolved_questions|checks|files_changed|risks|errors";

function section(text: string, name: string): string[] {
  const pattern = new RegExp(`(?:^|\\r?\\n)${name}:[ \\t]*([\\s\\S]*?)(?=\\r?\\n(?:${RESULT_SECTIONS}):|$)`, "i");
  const match = pattern.exec(text);
  if (!match?.[1]) return [];

  return match[1]
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*]\s*/, "").trim())
    .filter(Boolean);
}

export function taskResultFailed(details: unknown): boolean {
  return Value.Check(FailedTaskDetailsSchema, details);
}

export function parseTaskOutput(text: string): ParsedTaskOutput {
  const summary = section(text, "summary").join(" ") || text;

  return {
    summary,
    findings: section(text, "findings"),
    unresolvedQuestions: section(text, "unresolved_questions"),
    checks: section(text, "checks"),
    filesChanged: section(text, "files_changed"),
    risks: section(text, "risks"),
    errors: section(text, "errors"),
  };
}
