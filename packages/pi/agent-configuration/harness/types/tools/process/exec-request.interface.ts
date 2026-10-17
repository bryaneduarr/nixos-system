import type { ToolCancellation } from "./tool-cancellation.interface.ts";

/** A process to start with its working directory, timeout, and cancellation. */
export interface ExecRequest {
  /** Directory the process starts in. */
  readonly cwd: string;
  /** Program to start. */
  readonly command: ExecCommand;
  /** Milliseconds before the process is killed; zero disables the timeout. */
  readonly timeoutMs: number;
  /** Whether the caller can abort the process. */
  readonly cancellation: ToolCancellation;
}

/** A program to start, given as a shell line or as an argument vector. */
type ExecCommand = ShellCommand | ArgvCommand;

/** A shell line run through the system shell. */
interface ShellCommand {
  /** Marks a shell line. */
  readonly form: "shell";
  /** Shell line to run. */
  readonly shellLine: string;
}

/** A program and its arguments, run without a shell. */
interface ArgvCommand {
  /** Marks an argument vector. */
  readonly form: "argv";
  /** Program name followed by its arguments. */
  readonly argv: readonly [string, ...string[]];
}
