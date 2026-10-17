import type { KeyId } from "@earendil-works/pi-tui";
import type { ExitContext } from "./exit-context.interface.ts";

/** Handler of the explicit exit command, which receives the command arguments and context. */
export interface ExitCommandSpec {
  /** Text that describes the command in Pi's command list. */
  readonly description: string;
  /** Runs the explicit exit. */
  readonly handler: (args: string, ctx: ExitContext) => Promise<void>;
}

/** Handler of the explicit exit shortcut. */
export interface ExitShortcutSpec {
  /** Text that describes the shortcut in Pi's key help. */
  readonly description: string;
  /** Runs the explicit exit. */
  readonly handler: (ctx: ExitContext) => Promise<void>;
}

/** Pi registrations that the explicit exit command uses. */
export interface ExitCommandApi {
  /** Registers the explicit exit command. */
  readonly registerCommand: (name: string, spec: ExitCommandSpec) => void;
  /** Registers the explicit exit shortcut. */
  readonly registerShortcut: (shortcut: KeyId, spec: ExitShortcutSpec) => void;
}
