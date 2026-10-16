import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { InspectorOpener } from "../../types/inspector/request/inspector-opener.interface.ts";

let currentContext: ExtensionContext | undefined;
let openInspector: InspectorOpener | undefined;

/** Records the latest context so renderers can open UI without receiving ctx. */
export function setInspectContext(ctx: ExtensionContext): void {
  currentContext = ctx;
}

/** Registers the overlay opener (called once during extension setup). */
export function setInspectOpener(opener: InspectorOpener): void {
  openInspector = opener;
}

/**
 * Opens the activity inspector from a renderer/mouse handler.
 *
 * Renderers only receive args/theme/context, so they reach the UI through this
 * small indirection instead of importing the overlay directly.
 */
export function requestInspection(toolCallId: string): void {
  if (!currentContext || !openInspector) return;
  openInspector(currentContext, { kind: "tool-call", toolCallId });
}
