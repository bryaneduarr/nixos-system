import { RG_MATCH_EXIT_CODE, RG_NO_MATCH_EXIT_CODE } from "../../../constants/tools/process.constant.ts";
import { RgEventSchema } from "../../../schemas/tools/search/rg-event.schema.ts";
import type { ToolCancellation } from "../../../types/tools/process/tool-cancellation.interface.ts";
import type { SearchMatch } from "../../../types/tools/search/search-match.interface.ts";
import type { SearchScope } from "../../../types/tools/search/search-request.interface.ts";
import { parseJsonLine } from "../process/parse-json-line.service.ts";
import { runArgv } from "../process/run-argv.service.ts";

export async function rgMatches(
  cwd: string,
  query: string,
  scope: SearchScope,
  cancellation: ToolCancellation,
): Promise<SearchMatch[]> {
  const argv: readonly [string, ...string[]] = [
    "rg",
    "--json",
    "-n",
    "--no-messages",
    "-e",
    query,
    ...(scope.kind === "path" ? ["--", scope.path] : []),
  ];
  const result = await runArgv(cwd, argv, cancellation);
  const hasUsableOutput = result.code === RG_MATCH_EXIT_CODE || result.code === RG_NO_MATCH_EXIT_CODE;
  if (!hasUsableOutput) return [];
  const matches: SearchMatch[] = [];
  for (const rawLine of result.stdout.split("\n")) {
    if (!rawLine.trim()) continue;
    const parsedLine = parseJsonLine(rawLine, RgEventSchema);
    if (!parsedLine.valid || parsedLine.event.type !== "match") continue;
    const event = parsedLine.event;
    const matchedLine = event.data.lines;
    const lineText = matchedLine !== undefined && matchedLine.text !== undefined ? matchedLine.text : "";
    matches.push({
      file: event.data.path.text,
      line: event.data.line_number,
      text: lineText.replace(/\r?\n$/, ""),
    });
  }
  return matches;
}
