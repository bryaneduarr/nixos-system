import { z } from "zod";

export const resetsAtSchema = z.iso.datetime();

export const usageWindowSchema = z.strictObject({
  /** Name of the limit as the provider labels it, such as a session or weekly limit. */
  label: z.string().min(1),
  /** Share of the window still available, from 0 when exhausted to 100 when untouched. */
  percentRemaining: z.number().min(0).max(100),
  /** Moment the window resets, as an ISO 8601 UTC timestamp ending in Z. */
  resetsAt: resetsAtSchema,
});
