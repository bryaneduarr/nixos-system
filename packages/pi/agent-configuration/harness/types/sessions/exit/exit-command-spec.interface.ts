import type { ExitContext } from "./exit-context.interface.ts";

/** Handler of the explicit exit command, which receives the command arguments and context. */
export interface ExitCommandSpec {
  /** Text that describes the command in Pi's command list. */
  readonly description: string;
  /** Runs the explicit exit. */
  readonly handler: (args: string, ctx: ExitContext) => Promise<void>;
}
