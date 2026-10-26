/** Inputs for describing how long remains until a usage window resets. */
export interface ResetCountdownInput {
  /** Reset moment as an ISO 8601 UTC timestamp, validated before use. */
  readonly resetsAt: string;
  /** Moment the countdown is measured from. */
  readonly now: Date;
}

/** Countdown text for a reset, or the reason no text can be produced. */
export type ResetCountdown =
  | {
      /** The reset timestamp is valid and the countdown is formatted. */
      readonly state: "formatted";
      /** Countdown text such as `resets in 3d 4h 12m`. */
      readonly text: string;
    }
  | {
      /** The reset timestamp is not an ISO 8601 UTC datetime. */
      readonly state: "invalid-timestamp";
    };
