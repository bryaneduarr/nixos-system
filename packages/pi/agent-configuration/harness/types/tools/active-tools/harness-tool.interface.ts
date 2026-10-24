import type { HARNESS_TOOLS } from "../../../constants/tools/active-tools/harness-tools.constant.ts";

/** Name of a tool the harness provides itself. */
export type HarnessTool = (typeof HARNESS_TOOLS)[number];
