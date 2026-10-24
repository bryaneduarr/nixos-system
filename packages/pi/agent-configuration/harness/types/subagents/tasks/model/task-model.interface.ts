import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

/** Model a worker session runs on. */
export type TaskModel = NonNullable<ExtensionContext["model"]>;
