import type { HarnessVisualState } from "../presentation/harness-presentation.interface.ts";
import type { CodemodeCall } from "./codemode-call.interface.ts";

/** What the codemode box needs to describe one script run. */
export interface CodemodePresentationInput {
  /** JavaScript source of the script; empty while the call is still streaming. */
  readonly code: string;
  /** Tool calls the script has made so far. */
  readonly calls: readonly CodemodeCall[];
  /** Text output of the script, including Pi's status header; empty while it runs. */
  readonly text: string;
  /** Visual state of the run. */
  readonly state: HarnessVisualState;
}
