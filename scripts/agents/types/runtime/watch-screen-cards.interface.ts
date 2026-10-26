/** Cards drawn above the footer, kept between refreshes so a failed refresh can keep showing the last loaded cards. */
export type WatchScreenCards =
  | {
      /** Cards loaded by the most recent successful refresh. */
      readonly state: "shown";
      /** Rendered cards text. */
      readonly cards: string;
    }
  | {
      /** No refresh has loaded cards yet. */
      readonly state: "empty";
    };
