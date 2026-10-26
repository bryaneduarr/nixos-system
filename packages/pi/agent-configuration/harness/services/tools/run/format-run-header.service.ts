import { COMMAND_NOT_FOUND_EXIT_CODE } from "../../../constants/tools/process/process.constant.ts";
import { MISSING_COMMAND_HINT } from "../../../constants/tools/run/run-limits.constant.ts";
import type { ExecResult } from "../../../types/tools/process/exec-result.interface.ts";

export function formatRunHeader(result: ExecResult): string {
  const isTerminated = result.killed && !result.timedOut;
  const isMissingCommand = result.code === COMMAND_NOT_FOUND_EXIT_CODE;
  return [
    `exit: ${result.code}`,
    result.timedOut ? "timed out" : "",
    isTerminated ? "terminated" : "",
    isMissingCommand ? MISSING_COMMAND_HINT : "",
  ]
    .filter(Boolean)
    .join("\n");
}
