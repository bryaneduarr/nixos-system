import type { SubagentSelection } from "../subagents/subagent-selection.interface.ts";
import type { InspectorPage } from "./inspector-page.interface.ts";

/** Page state that decides which rows the tool list shows. */
export interface InspectorRowsOptions {
  /** Page currently shown. */
  readonly page: InspectorPage;
  /** Ids of subagent tasks whose child calls are shown. */
  readonly expandedTasks: ReadonlySet<string>;
  /** Subagent task shown on the subagent page. */
  readonly openedSubagent: SubagentSelection;
}
