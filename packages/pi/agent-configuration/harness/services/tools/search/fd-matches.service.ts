import { NO_TIMEOUT_MS } from "../../../constants/tools/process.constant.ts";
import type { ToolCancellation } from "../../../types/tools/process/tool-cancellation.interface.ts";
import type { SearchScope } from "../../../types/tools/search/search-request.interface.ts";
import { runCommand } from "../process/run-command.service.ts";

export async function fdMatches(
  cwd: string,
  query: string,
  scope: SearchScope,
  cancellation: ToolCancellation,
): Promise<string[]> {
  const argv: readonly [string, ...string[]] = [
    "fd",
    "--type",
    "f",
    "--hidden",
    "--exclude",
    ".git",
    "--exclude",
    "node_modules",
    "--fixed-strings",
    query,
    scope.kind === "path" ? scope.path : ".",
  ];
  const result = await runCommand({ command: { form: "argv", argv }, cwd, timeoutMs: NO_TIMEOUT_MS, cancellation });
  if (result.code !== 0) return [];
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (line.startsWith("./") ? line.slice(2) : line));
}
