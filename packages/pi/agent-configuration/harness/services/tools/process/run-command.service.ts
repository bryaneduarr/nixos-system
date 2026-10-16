import { spawn } from "node:child_process";
import { MAX_CAPTURE_BYTES, NO_TIMEOUT_MS } from "../../../constants/tools/process.constant.ts";
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
            stdio: ["ignore", "pipe", "pipe"],
          })
        : spawn(command.shellLine, {
            cwd,
            shell: true,
            env: process.env,
            stdio: ["ignore", "pipe", "pipe"],
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
            child.kill("SIGKILL");
          }, timeoutMs)
        : undefined;

    const onAbort = () => {
      killed = true;
      child.kill("SIGKILL");
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

    child.stdout.on("data", (data: Buffer) => {
      if (stdout.length < MAX_CAPTURE_BYTES) stdout += data.toString();
    });
    child.stderr.on("data", (data: Buffer) => {
      if (stderr.length < MAX_CAPTURE_BYTES) stderr += data.toString();
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
        code: 127,
        killed,
        timedOut,
      });
    });

    child.on("close", (code: number | null) => {
      finish({
        stdout,
        stderr,
        code: code ?? (killed ? 124 : 1),
        killed: killed || timedOut,
        timedOut,
      });
    });
  });
}
