import { Value } from "typebox/value";
import { NO_TIMEOUT_MS } from "../../../constants/tools/process.constant.ts";
import { RgEventSchema } from "../../../schemas/tools/search/rg-event.schema.ts";
import type { ToolCancellation } from "../../../types/tools/process/tool-cancellation.interface.ts";
import type { SearchMatch } from "../../../types/tools/search/search-match.interface.ts";
import type { SearchScope } from "../../../types/tools/search/search-request.interface.ts";
import { runCommand } from "../process/run-command.service.ts";
import { parseJsonLine } from "./parse-json-line.service.ts";

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
  const result = await runCommand({ command: { form: "argv", argv }, cwd, timeoutMs: NO_TIMEOUT_MS, cancellation });
  if (result.code !== 0 && result.code !== 1) return [];
  const matches: SearchMatch[] = [];
  for (const rawLine of result.stdout.split("\n")) {
    if (!rawLine.trim()) continue;
    const parsedLine = parseJsonLine(rawLine);
    if (!parsedLine.parsed || !Value.Check(RgEventSchema, parsedLine.value)) continue;
    const event = parsedLine.value;
    if (event.type !== "match") continue;
    matches.push({
      file: event.data.path.text,
      line: event.data.line_number,
      text: (event.data.lines?.text ?? "").replace(/\r?\n$/, ""),
    });
  }
  return matches;
}
