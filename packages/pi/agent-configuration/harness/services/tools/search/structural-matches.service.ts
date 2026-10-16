import { Value } from "typebox/value";
import { NO_TIMEOUT_MS } from "../../../constants/tools/process.constant.ts";
import { AstGrepEventSchema } from "../../../schemas/tools/search/ast-grep-event.schema.ts";
import type { ToolCancellation } from "../../../types/tools/process/tool-cancellation.interface.ts";
import type { SearchMatch } from "../../../types/tools/search/search-match.interface.ts";
import type { SearchScope } from "../../../types/tools/search/search-request.interface.ts";
import { runCommand } from "../process/run-command.service.ts";
import { parseJsonLine } from "./parse-json-line.service.ts";

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
  const result = await runCommand({ command: { form: "argv", argv }, cwd, timeoutMs: NO_TIMEOUT_MS, cancellation });
  if (result.code !== 0) return [];
  const matches: SearchMatch[] = [];
  for (const rawLine of result.stdout.split("\n")) {
    if (!rawLine.trim()) continue;
    const parsedLine = parseJsonLine(rawLine);
    if (!parsedLine.parsed || !Value.Check(AstGrepEventSchema, parsedLine.value)) continue;
    const event = parsedLine.value;
    const [firstLine = ""] = (event.lines ?? "").split(/\r?\n/);
    matches.push({
      file: event.file,
      line: event.range.start.line + 1,
      text: firstLine,
    });
  }
  return matches;
}
