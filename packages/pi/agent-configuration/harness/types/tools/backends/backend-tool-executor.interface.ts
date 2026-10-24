import type { ExtensionToolContext } from "@earendil-works/pi-coding-agent";

/** The part of a tool context that runs another registered tool, such as a language-server tool. */
export type BackendToolExecutor = Pick<ExtensionToolContext, "executeTool">;
