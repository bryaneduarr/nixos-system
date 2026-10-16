import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { ModelIdentity } from "../codex-models/model-identity.interface.ts";

/** Operations the fast-mode command and session events use to read and change fast mode. */
export interface FastModeControls {
  /** Whether the user has turned fast mode on. */
  readonly isEnabled: () => boolean;
  /** Whether the model can use priority service tier requests. */
  readonly isModelSupported: (model: ModelIdentity) => boolean;
  /** Saves and applies a new fast-mode choice. */
  readonly setEnabled: (nextEnabled: boolean, ctx: ExtensionContext) => void;
  /** Shows the fast-mode badge for the current model. */
  readonly updateStatus: (ctx: ExtensionContext) => void;
  /** Loads the saved preference and session state when a session starts. */
  readonly restore: (ctx: ExtensionContext) => void;
}
