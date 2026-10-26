import { z } from "zod";

export const claudeOauthCredentialsSchema = z.object({
  /** Bearer token that authorizes requests to the usage endpoint. */
  accessToken: z.string().min(1),
  /** Moment the access token expires, as epoch milliseconds. */
  expiresAt: z.number(),
  /** Subscription name stored for the account, such as `max`; blank when the account has none. */
  subscriptionType: z.string(),
});

export const claudeCredentialsFileSchema = z.object({
  /** OAuth login Claude Code stores in the credentials file; sibling keys are ignored. */
  claudeAiOauth: claudeOauthCredentialsSchema,
});

export const claudeAccessTokenSchema = z.object({
  /** Presence check that tells a missing login apart from a login with an unexpected shape. */
  claudeAiOauth: z.object({
    /** Bearer token that must be present and non-empty for the login to count as signed in. */
    accessToken: z.string().min(1),
  }),
});
