/** A subagent task is selected on the subagents page. */
interface SelectedSubagent {
  /** Discriminates a selected subagent from no selection. */
  readonly kind: "selected";
  /** Id of the selected subagent task. */
  readonly id: string;
}

/** No subagent task is selected on the subagents page. */
interface NoSubagentSelection {
  /** Discriminates the absence of a selection. */
  readonly kind: "none";
}

/** Subagent task selection state. */
export type SubagentSelection = SelectedSubagent | NoSubagentSelection;
