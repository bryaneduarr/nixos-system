import { z } from "zod";

const claudeLimitModelSchema = z.object({
  /** Display name of the model the limit applies to, such as `Fable`. */
  display_name: z.string(),
});

const claudeLimitScopeSchema = z
  .object({
    /** Model the limit is scoped to. */
    model: claudeLimitModelSchema,
  })
  .nullable()
  .transform((scope) => {
    if (scope === null) return { state: "unscoped" as const };
    return { state: "model" as const, modelName: scope.model.display_name };
  });

export const claudeUsageLimitSchema = z.object({
  /** Limit category the provider reports, such as `session`, `weekly_all`, or `weekly_scoped`. */
  kind: z.string(),
  /** Share of the limit already used, as the provider reports it. */
  percent: z.number(),
  /** Moment the limit resets, as an ISO 8601 datetime with a UTC offset. */
  resets_at: z.iso.datetime({ offset: true }),
  /** Model scope of the limit, or unscoped when the provider reports none. */
  scope: claudeLimitScopeSchema,
});

export const claudeUsageResponseSchema = z.object({
  /** Every usage limit the account has, in the order the provider reports them. */
  limits: z.array(claudeUsageLimitSchema),
});
