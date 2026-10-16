import { spawn } from "node:child_process";

export interface ExecResult {
  stdout: string;
  stderr: string;
  code: number;
  killed: boolean;
  timedOut: boolean;
}

export interface ExecOptions {
  command?: string;
  argv?: string[];
  cwd: string;
  timeoutMs?: number;
  signal?: AbortSignal;
  env?: NodeJS.ProcessEnv;
}

const MAX_CAPTURE_BYTES = 32 * 1024 * 1024;

export async function runCommand(options: ExecOptions): Promise<ExecResult> {
  const { command, argv, cwd, timeoutMs = 0, signal, env } = options;

  return await new Promise<ExecResult>((resolve) => {
    const useArgv = Array.isArray(argv) && argv.length > 0;
    const child = useArgv
      ? spawn(argv[0], argv.slice(1), {
          cwd,
          shell: false,
          env: env ?? process.env,
          stdio: ["ignore", "pipe", "pipe"],
        })
      : spawn(command ?? "", {
          cwd,
          shell: true,
          env: env ?? process.env,
          stdio: ["ignore", "pipe", "pipe"],
        });

    let stdout = "";
    let stderr = "";
    let killed = false;
    let timedOut = false;
    let settled = false;

    const timer =
      timeoutMs > 0
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

    if (signal) {
      if (signal.aborted) {
        onAbort();
      } else {
        signal.addEventListener("abort", onAbort, { once: true });
      }
    }

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", onAbort);
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
