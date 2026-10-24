import type { RunDirectory } from "./run-directory.interface.ts";

/** A run directory that cannot host the command. */
export type BlockedRunDirectory = Extract<RunDirectory, { state: "blocked" }>;
