/** Result of reading the saved fast-mode preference. */
export type FastModePreferenceLookup =
  /** A valid preference was saved. */
  | { readonly found: true; readonly enabled: boolean }
  /** No valid saved preference exists. */
  | { readonly found: false };
