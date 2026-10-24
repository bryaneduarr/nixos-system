/** Absolute directory a run command starts in once it is checked, and created when missing. */
export type RunDirectory =
  | {
      /** The directory exists and can host the command. */
      readonly state: "ready";
      /** Absolute directory path. */
      readonly directory: string;
    }
  | {
      /** The path cannot host the command. */
      readonly state: "blocked";
      /** Absolute path the command asked for. */
      readonly directory: string;
      /** Why the path cannot host the command. */
      readonly reason: "not-a-directory" | "cannot-create";
    };
