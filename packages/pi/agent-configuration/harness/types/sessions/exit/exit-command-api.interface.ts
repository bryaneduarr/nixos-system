import type { KeyId } from "@earendil-works/pi-tui";
import type { ExitCommandSpec } from "./exit-command-spec.interface.ts";
import type { ExitShortcutSpec } from "./exit-shortcut-spec.interface.ts";

/** Pi registrations that the explicit exit command uses. */
export interface ExitCommandApi {
  /** Registers the explicit exit command. */
  readonly registerCommand: (name: string, spec: ExitCommandSpec) => void;
  /** Registers the explicit exit shortcut. */
  readonly registerShortcut: (shortcut: KeyId, spec: ExitShortcutSpec) => void;
}
