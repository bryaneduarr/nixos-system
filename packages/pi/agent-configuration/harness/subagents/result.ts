export interface ParsedTaskOutput {
  summary: string;
  findings: string[];
  unresolvedQuestions: string[];
  checks: string[];
  filesChanged: string[];
  risks: string[];
  errors: string[];
}

const RESULT_SECTIONS = "status|summary|findings|unresolved_questions|checks|files_changed|risks|errors";
const FAILED_TASK_STATUSES = new Set(["error", "cancelled"]);

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
  if (!details || typeof details !== "object") return false;

  const status = (details as { status?: unknown }).status;
  return typeof status === "string" && FAILED_TASK_STATUSES.has(status);
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
