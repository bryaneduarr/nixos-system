import type { TaskResult } from "../../../types/subagents/result/task-result.interface.ts";

export function formatTaskResult(taskResult: TaskResult): string {
  const content = {
    id: taskResult.id,
    title: taskResult.title,
    role: taskResult.role,
    tools: taskResult.tools,
    verification_commands: taskResult.verificationCommands,
    status: taskResult.status,
    summary: taskResult.summary,
    findings: taskResult.findings,
    unresolved_questions: taskResult.unresolvedQuestions,
    checks: taskResult.checks,
    files_changed: taskResult.filesChanged,
    risks: taskResult.risks,
    errors: taskResult.errors,
  };

  return JSON.stringify(content);
}
