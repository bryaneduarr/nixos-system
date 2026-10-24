/** Page of the inspector: tool calls, subagent tasks, one opened subagent, or what the agent did besides tool calls. */
export type InspectorPage = "tools" | "subagents" | "subagent" | "history";

/** Page that lists rows next to a detail pane. */
export type ListInspectorPage = Exclude<InspectorPage, "subagents">;

/** Pane that receives keyboard input: the row list or the detail pane. */
export type InspectorFocus = "list" | "detail";
