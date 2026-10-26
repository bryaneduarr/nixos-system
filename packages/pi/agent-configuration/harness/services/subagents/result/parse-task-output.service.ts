import { RESULT_SECTION_NAMES } from "../../../constants/subagents/result/result-section.constant.ts";
import type { ParsedTaskOutput } from "../../../types/subagents/result/parsed-task-output.interface.ts";

const SECTION_NAME_ALTERNATION = RESULT_SECTION_NAMES.join("|");

function sectionItems(text: string, name: string): string[] {
  const pattern = new RegExp(
    `(?:^|\\r?\\n)${name}:[ \\t]*([\\s\\S]*?)(?=\\r?\\n(?:${SECTION_NAME_ALTERNATION}):|$)`,
    "i",
  );
  const match = pattern.exec(text);
  if (match === null) return [];

  const body = match[1];
  if (body === undefined) return [];

  return body
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*]\s*/, "").trim())
    .filter(Boolean);
}

export function parseTaskOutput(text: string): ParsedTaskOutput {
  const summary = sectionItems(text, "summary").join(" ") || text;

  return {
    summary,
    findings: sectionItems(text, "findings"),
    unresolvedQuestions: sectionItems(text, "unresolved_questions"),
    checks: sectionItems(text, "checks"),
    filesChanged: sectionItems(text, "files_changed"),
    risks: sectionItems(text, "risks"),
    errors: sectionItems(text, "errors"),
  };
}
