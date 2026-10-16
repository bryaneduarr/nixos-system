import type { KeyId } from "@earendil-works/pi-tui";
import type { DetailKeyContext } from "./detail-key-context.interface.ts";

/** A detail-pane key binding and the motion it performs. */
export interface DetailMotion {
  /** Key sequences that trigger the motion. */
  readonly keys: readonly KeyId[];
  /** Performs the motion on the detail pane. */
  run(context: DetailKeyContext): void;
}
