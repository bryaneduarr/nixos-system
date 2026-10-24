import type { GitHistoryRequest } from "../../../types/tools/search/git-history-request.interface.ts";
import { runArgv } from "../process/run-argv.service.ts";

export async function gitHistory(request: GitHistoryRequest): Promise<string> {
  const { cwd, query, scope, limit, cancellation } = request;
  const argv: readonly [string, ...string[]] = [
    "git",
    "log",
    `-S${query}`,
    `-n${limit}`,
    "--oneline",
    ...(scope.kind === "path" ? ["--", scope.path] : []),
  ];
  const result = await runArgv(cwd, argv, cancellation);
  if (result.code !== 0) {
    return `History unavailable: ${result.stderr.trim() || "not a git repository"}`;
  }
  const lines = result.stdout.trim().split("\n").filter(Boolean);
  if (lines.length === 0) return `History:\nno commits touching "${query}"`;
  return `History:\n${lines.join("\n")}\n\nAdditional commits omitted: ${Math.max(0, lines.length - limit)}`;
}
