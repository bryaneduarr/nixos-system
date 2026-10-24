import { RG_ERROR_EXIT_CODE } from "../../../constants/tools/search/ripgrep.constant.ts";
import { EMPTY_LINE_TEXT } from "../../../constants/tools/search/search-text.constant.ts";
import { RgEventSchema } from "../../../schemas/tools/search/rg-event.schema.ts";
import type { SearchCommandRequest } from "../../../types/tools/search/search-command-request.interface.ts";
import type { SearchMatch } from "../../../types/tools/search/search-match.interface.ts";
import type { SearchScope } from "../../../types/tools/search/search-scope.interface.ts";
import { parseJsonLine } from "../process/parse-json-line.service.ts";
import { runArgv } from "../process/run-argv.service.ts";

function rgArgv(query: string, scope: SearchScope, isLiteral: boolean): readonly [string, ...string[]] {
  return [
    "rg",
    "--json",
    "-n",
    "--no-messages",
    ...(isLiteral ? ["--fixed-strings"] : []),
    "-e",
    query,
    ...(scope.kind === "path" ? ["--", scope.path] : []),
  ];
}

function parseRgMatches(stdout: string): SearchMatch[] {
  const matches: SearchMatch[] = [];
  for (const rawLine of stdout.split("\n")) {
    if (!rawLine.trim()) continue;
    const parsedLine = parseJsonLine(rawLine, RgEventSchema);
    if (!parsedLine.valid || parsedLine.event.type !== "match") continue;
    const event = parsedLine.event;
    const lineText = "text" in event.data.lines ? event.data.lines.text : EMPTY_LINE_TEXT;
    matches.push({
      file: event.data.path.text,
      line: event.data.line_number,
      text: lineText.replace(/\r?\n$/, ""),
    });
  }
  return matches;
}

export async function rgMatches(request: SearchCommandRequest): Promise<SearchMatch[]> {
  const { cwd, query, scope, cancellation } = request;
  const result = await runArgv(cwd, rgArgv(query, scope, false), cancellation);
  const matches = parseRgMatches(result.stdout);
  const isRejectedPattern = result.code === RG_ERROR_EXIT_CODE && matches.length === 0;
  if (!isRejectedPattern) return matches;

  const literalResult = await runArgv(cwd, rgArgv(query, scope, true), cancellation);
  return parseRgMatches(literalResult.stdout);
}
