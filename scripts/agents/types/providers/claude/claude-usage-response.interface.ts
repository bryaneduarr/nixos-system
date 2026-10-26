import type { z } from "zod";
import type {
  claudeUsageLimitSchema,
  claudeUsageResponseSchema,
} from "../../../schemas/providers/claude/claude-usage-response.schema.ts";

/** One usage limit as the Claude usage endpoint reports it, with its model scope converted to a union. */
export type ClaudeUsageLimit = Readonly<z.output<typeof claudeUsageLimitSchema>>;

/** Usage body returned by the Claude usage endpoint, with the fields the CLI reads. */
export type ClaudeUsageResponse = Readonly<z.output<typeof claudeUsageResponseSchema>>;
