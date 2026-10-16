import type { ToolActivity } from "./tool-activity.interface.ts";

/** Result of looking up a recorded tool call by its identifier. */
export type ToolActivityLookup = { readonly found: true; readonly entry: ToolActivity } | { readonly found: false };
