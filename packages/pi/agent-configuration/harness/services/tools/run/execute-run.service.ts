import { DEFAULT_RUN_DIRECTORY } from "../../../constants/tools/run/run-defaults.constant.ts";
import { DEFAULT_RUN_TIMEOUT_MS } from "../../../constants/tools/run/run-limits.constant.ts";
import type { ExecuteRunRequest } from "../../../types/tools/run/execute-run-request.interface.ts";
import { toTextToolResult } from "../result/to-text-tool-result.service.ts";
import { describeBlockedRunDirectory } from "./describe-blocked-run-directory.service.ts";
import { prepareRunDirectory } from "./prepare-run-directory.service.ts";
import { runShell } from "./run-shell.service.ts";

export async function executeRun(request: ExecuteRunRequest) {
  const { cwd, parameters, cancellation } = request;
  const runDirectory = await prepareRunDirectory(cwd, parameters.cwd ?? DEFAULT_RUN_DIRECTORY);
  if (runDirectory.state === "blocked") {
    return { isError: true, ...toTextToolResult(describeBlockedRunDirectory(runDirectory)) };
  }
  const text = await runShell({
    cwd,
    directory: runDirectory.directory,
    command: parameters.command,
    timeoutMs: parameters.timeoutMs ?? DEFAULT_RUN_TIMEOUT_MS,
    cancellation,
  });
  return toTextToolResult(text);
}
