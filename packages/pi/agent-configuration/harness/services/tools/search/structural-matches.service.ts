import { EMPTY_LINE_TEXT } from "../../../constants/tools/search/search-text.constant.ts";
import { AstGrepEventSchema } from "../../../schemas/tools/search/ast-grep-event.schema.ts";
import type { SearchCommandRequest } from "../../../types/tools/search/search-command-request.interface.ts";
import type { SearchMatch } from "../../../types/tools/search/search-match.interface.ts";
import { parseJsonLine } from "../process/parse-json-line.service.ts";
import { runArgv } from "../process/run-argv.service.ts";

const AFTER_FIRST_LINE_PATTERN = /\r?\n[\s\S]*$/;

export async function structuralMatches(request: SearchCommandRequest): Promise<SearchMatch[]> {
  const { cwd, query, scope, cancellation } = request;
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
    matches.push({
      file: event.file,
      line: event.range.start.line + 1,
      text: event.lines === undefined ? EMPTY_LINE_TEXT : event.lines.replace(AFTER_FIRST_LINE_PATTERN, ""),
    });
  }
  return matches;
}
