import type { SearchCommandRequest } from "../../../types/tools/search/search-command-request.interface.ts";
import { runArgv } from "../process/run-argv.service.ts";

export async function fdMatches(request: SearchCommandRequest): Promise<string[]> {
  const { cwd, query, scope, cancellation } = request;
  const isPathQuery = query.includes("/");
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
    ...(isPathQuery ? ["--full-path"] : []),
    query,
    scope.kind === "path" ? scope.path : ".",
  ];
  const result = await runArgv(cwd, argv, cancellation);
  if (result.code !== 0) return [];
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (line.startsWith("./") ? line.slice(2) : line));
}
