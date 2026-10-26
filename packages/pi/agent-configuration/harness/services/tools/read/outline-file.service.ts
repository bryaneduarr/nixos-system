import { dirname } from "node:path";
import { OUTLINE_MAX_LINES } from "../../../constants/tools/read/read-limits.constant.ts";
import type { BackendToolResult } from "../../../types/tools/backends/backend-tool-result.interface.ts";
import { runArgv } from "../process/run-argv.service.ts";

export async function outlineFile(absolutePath: string): Promise<BackendToolResult> {
  const result = await runArgv(dirname(absolutePath), ["ast-grep", "outline", absolutePath], {
    kind: "uncancellable",
  });
  if (result.code !== 0) return { found: false };

  const [, ...items] = result.stdout.trimEnd().split("\n");
  if (items.length === 0) return { found: false };

  const shown = items.slice(0, OUTLINE_MAX_LINES).map((item) => item.trimStart());
  const omitted = items.length - shown.length;
  const omittedNote = omitted > 0 ? [`... ${omitted} more items`] : [];
  return { found: true, text: [...shown, ...omittedNote].join("\n") };
}
