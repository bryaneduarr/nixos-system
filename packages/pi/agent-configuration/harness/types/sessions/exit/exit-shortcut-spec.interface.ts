import type { ExitContext } from "./exit-context.interface.ts";

/** Handler of the explicit exit shortcut. */
export interface ExitShortcutSpec {
  /** Text that describes the shortcut in Pi's key help. */
  readonly description: string;
  /** Runs the explicit exit. */
  readonly handler: (ctx: ExitContext) => Promise<void>;
}
