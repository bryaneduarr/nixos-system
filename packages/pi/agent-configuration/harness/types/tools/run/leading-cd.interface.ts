/** Result of separating a leading `cd <directory> &&` from a shell command. */
export type LeadingCd =
  | {
      /** The command started with a plain `cd` to one directory. */
      readonly kind: "split";
      /** Directory the `cd` targeted, without quotes. */
      readonly directory: string;
      /** Remaining command after the `cd` and its separator. */
      readonly command: string;
    }
  | {
      /** The command does not start with a plain `cd`. */
      readonly kind: "none";
    };
