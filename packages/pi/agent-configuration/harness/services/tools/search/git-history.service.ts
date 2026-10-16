import { NO_TIMEOUT_MS } from "../../../constants/tools/process.constant.ts";
import type { ToolCancellation } from "../../../types/tools/process/tool-cancellation.interface.ts";
import type { SearchScope } from "../../../types/tools/search/search-request.interface.ts";
import { runCommand } from "../process/run-command.service.ts";

export async function gitHistory(
  cwd: string,
  query: string,
  scope: SearchScope,
  limit: number,
  cancellation: ToolCancellation,
): Promise<string> {
  const argv: readonly [string, ...string[]] = [
    "git",
    "log",
    `-S${query}`,
    `-n${limit}`,
    "--oneline",
    ...(scope.kind === "path" ? ["--", scope.path] : []),
  ];
  const result = await runCommand({ command: { form: "argv", argv }, cwd, timeoutMs: NO_TIMEOUT_MS, cancellation });
  if (result.code !== 0) {
    return `History unavailable: ${result.stderr.trim() || "not a git repository"}`;
  }
  const lines = result.stdout.trim().split("\n").filter(Boolean);
  if (lines.length === 0) return `History:\nno commits touching "${query}"`;
  return `History:\n${lines.join("\n")}\n\nAdditional commits omitted: ${Math.max(0, lines.length - limit)}`;
}
