import { spawn } from "node:child_process";
import {
  CHILD_STDIO,
  COMMAND_NOT_FOUND_EXIT_CODE,
  EXIT_CODE_KILLED,
  EXIT_CODE_UNKNOWN,
  KILL_SIGNAL,
  MAX_CAPTURE_BYTES,
  NO_TIMEOUT_MS,
} from "../../../constants/tools/process/process.constant.ts";
import type { ExecRequest } from "../../../types/tools/process/exec-request.interface.ts";
import type { ExecResult } from "../../../types/tools/process/exec-result.interface.ts";

export async function runCommand(request: ExecRequest): Promise<ExecResult> {
  const { command, cwd, timeoutMs, cancellation } = request;

  return await new Promise<ExecResult>((resolve) => {
    const child =
      command.form === "argv"
        ? spawn(command.argv[0], command.argv.slice(1), {
            cwd,
            shell: false,
            env: process.env,
            stdio: CHILD_STDIO,
          })
        : spawn(command.shellLine, {
            cwd,
            shell: true,
            env: process.env,
            stdio: CHILD_STDIO,
          });

    let stdout = "";
    let stderr = "";
    let killed = false;
    let timedOut = false;
    let settled = false;

    const timer =
      timeoutMs > NO_TIMEOUT_MS
        ? setTimeout(() => {
            timedOut = true;
            killed = true;
            child.kill(KILL_SIGNAL);
          }, timeoutMs)
        : undefined;

    const onAbort = () => {
      killed = true;
      child.kill(KILL_SIGNAL);
    };

    if (cancellation.kind === "abortable") {
      if (cancellation.signal.aborted) {
        onAbort();
      } else {
        cancellation.signal.addEventListener("abort", onAbort, { once: true });
      }
    }

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      if (cancellation.kind === "abortable") cancellation.signal.removeEventListener("abort", onAbort);
    };

    child.stdout.on("data", (chunk: Buffer) => {
      if (stdout.length < MAX_CAPTURE_BYTES) stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      if (stderr.length < MAX_CAPTURE_BYTES) stderr += chunk.toString();
    });

    const finish = (result: ExecResult) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };

    child.on("error", (error: Error) => {
      finish({
        stdout,
        stderr: `${stderr}${stderr ? "\n" : ""}${error.message}`,
        code: COMMAND_NOT_FOUND_EXIT_CODE,
        killed,
        timedOut,
      });
    });

    child.on("close", (code) => {
      finish({
        stdout,
        stderr,
        code: code ?? (killed ? EXIT_CODE_KILLED : EXIT_CODE_UNKNOWN),
        killed: killed || timedOut,
        timedOut,
      });
    });
  });
}
