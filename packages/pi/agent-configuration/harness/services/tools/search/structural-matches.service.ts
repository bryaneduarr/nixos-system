import { AstGrepEventSchema } from "../../../schemas/tools/search/ast-grep-event.schema.ts";
import type { ToolCancellation } from "../../../types/tools/process/tool-cancellation.interface.ts";
import type { SearchMatch } from "../../../types/tools/search/search-match.interface.ts";
import type { SearchScope } from "../../../types/tools/search/search-request.interface.ts";
import { parseJsonLine } from "../process/parse-json-line.service.ts";
import { runArgv } from "../process/run-argv.service.ts";

export async function structuralMatches(
  cwd: string,
  query: string,
  scope: SearchScope,
  cancellation: ToolCancellation,
): Promise<SearchMatch[]> {
  const argv: readonly [string, ...string[]] = [
    "ast-grep",
    "run",
    "--pattern",
    query,
    "--json=stream",
    ...(scope.kind === "path" ? [scope.path] : []),
  ];
  const result = await runArgv(cwd, argv, cancellation);
  if (result.code !== 0) return [];
  const matches: SearchMatch[] = [];
  for (const rawLine of result.stdout.split("\n")) {
    if (!rawLine.trim()) continue;
    const parsedLine = parseJsonLine(rawLine, AstGrepEventSchema);
    if (!parsedLine.valid) continue;
    const event = parsedLine.event;
    const [firstLine = ""] = (event.lines ?? "").split(/\r?\n/);
    matches.push({
      file: event.file,
      line: event.range.start.line + 1,
      text: firstLine,
    });
  }
  return matches;
}
