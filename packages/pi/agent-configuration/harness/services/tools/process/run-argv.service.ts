import { NO_TIMEOUT_MS } from "../../../constants/tools/process/process.constant.ts";
import type { ExecResult } from "../../../types/tools/process/exec-result.interface.ts";
import type { ToolCancellation } from "../../../types/tools/process/tool-cancellation.interface.ts";
import { runCommand } from "./run-command.service.ts";

export function runArgv(
  cwd: string,
  argv: readonly [string, ...string[]],
  cancellation: ToolCancellation,
): Promise<ExecResult> {
  return runCommand({ command: { form: "argv", argv }, cwd, timeoutMs: NO_TIMEOUT_MS, cancellation });
}
