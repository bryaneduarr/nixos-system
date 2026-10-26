import { z } from "zod";
import { resetsAtSchema } from "../../usage/usage-window.schema.ts";

const opencodeUsageWindowSchema = z.object({
  /** Share of the window already used, from 0 to 100, as the provider reports it. */
  percent: z.number(),
  /** Moment the window resets, as an ISO 8601 UTC timestamp ending in Z. */
  resetsAt: resetsAtSchema,
});

export const opencodeUsageResponseSchema = z.object({
  /** Limit windows keyed by window name, such as `rolling`, in the order the provider reports them. */
  usage: z.record(z.string(), opencodeUsageWindowSchema),
});
