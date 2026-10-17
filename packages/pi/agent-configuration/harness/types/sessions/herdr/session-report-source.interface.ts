/** Conversation reference that Herdr stores with a reported Pi session. */
export type SessionReportSource =
  /** Path of the conversation file that Pi saves. */
  | { readonly kind: "file"; readonly path: string }
  /** Session identifier used when no conversation file exists. */
  | { readonly kind: "identifier" };
