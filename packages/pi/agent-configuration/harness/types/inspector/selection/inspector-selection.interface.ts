/** Opens the inspector without selecting a specific row. */
interface LatestSelection {
  /** Discriminates the latest-row selection. */
  readonly kind: "latest";
}

/** Opens the inspector with the row of one tool call selected. */
interface ToolCallSelection {
  /** Discriminates the tool call selection. */
  readonly kind: "tool-call";
  /** Id of the tool call to select. */
  readonly toolCallId: string;
}

/** Row the inspector selects when it opens. */
export type InspectorSelection = LatestSelection | ToolCallSelection;
