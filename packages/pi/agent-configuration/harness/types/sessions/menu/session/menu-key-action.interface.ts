/** What the session menu does in response to one terminal input. */
export type MenuKeyAction =
  | "stop-filtering"
  | "edit-filter"
  | "cancel"
  | "new-session"
  | "start-filtering"
  | "choose"
  | "move-selection";
