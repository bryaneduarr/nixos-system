import type { SUBAGENT_TOOLS } from "../../../constants/subagents/roles.constant.ts";

/** Tool name a subagent may be granted. */
export type SubagentTool = (typeof SUBAGENT_TOOLS)[number];
