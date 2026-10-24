/** Where a search looks: the whole workspace or one path. */
export type SearchScope =
  | {
      /** Marks a path-limited search. */
      readonly kind: "path";
      /** File or directory to search. */
      readonly path: string;
    }
  | {
      /** Marks a workspace-wide search. */
      readonly kind: "workspace";
    };
