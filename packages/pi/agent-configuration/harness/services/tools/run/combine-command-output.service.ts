import { stripVTControlCharacters } from "node:util";
import type { ExecResult } from "../../../types/tools/process/exec-result.interface.ts";

export function combineCommandOutput(result: ExecResult): string {
  return stripVTControlCharacters(
    [result.stdout, result.stderr]
      .filter((part) => part.trim().length > 0)
      .join(result.stdout && result.stderr ? "\n" : ""),
  ).trimEnd();
}
