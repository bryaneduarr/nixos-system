import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { InspectorSelection } from "../selection/inspector-selection.interface.ts";

/* Opens the inspector overlay for an extension context and a selection. */
export type InspectorOpener = (ctx: ExtensionContext, selection: InspectorSelection) => void;
