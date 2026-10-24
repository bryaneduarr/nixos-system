import type { SubToolActivity } from "../../activity/parsing/subagent/sub-tool-activity.interface.ts";
import type { ToolActivity } from "../../activity/store/tool-activity.interface.ts";

/** Row of the tool list: a top-level tool call or a child call of a subagent task. */
export type InspectorRow = EntryInspectorRow | SubToolInspectorRow;

/** Row for a top-level tool call. */
interface EntryInspectorRow {
  /** Discriminates top-level rows from child call rows. */
  readonly level: "entry";
  /** Tool call shown by the row. */
  readonly entry: ToolActivity;
}

/** Row for a child call listed under its subagent task. */
interface SubToolInspectorRow {
  /** Discriminates child call rows from top-level rows. */
  readonly level: "sub";
  /** Subagent task that owns the child call. */
  readonly entry: ToolActivity;
  /** Child call shown by the row. */
  readonly sub: SubToolActivity;
}
