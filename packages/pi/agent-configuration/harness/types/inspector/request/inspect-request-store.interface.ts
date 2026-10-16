import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { InspectorOpener } from "./inspector-opener.interface.ts";

/** Connects renderers and mouse handlers to the inspector overlay without importing it. */
export interface InspectRequestStore {
  /** Records the latest extension context so the overlay can open from renderers. */
  setContext(ctx: ExtensionContext): void;
  /** Registers the function that opens the overlay. */
  setOpener(opener: InspectorOpener): void;
  /** Opens the inspector with the given tool call row selected, when both are registered. */
  requestInspection(toolCallId: string): void;
}
