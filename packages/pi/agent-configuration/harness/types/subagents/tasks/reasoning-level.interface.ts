import type { REASONING_LEVELS } from "../../../constants/subagents/reasoning.constant.ts";

/* Reasoning level a task worker can run with. */
export type ReasoningLevel = (typeof REASONING_LEVELS)[number];
