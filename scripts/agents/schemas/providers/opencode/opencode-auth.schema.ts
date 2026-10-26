import { z } from "zod";
import { OPENCODE_AUTH_ENTRY_NAME } from "../../../constants/providers/opencode/opencode-provider.constant.ts";

const opencodeApiKeyEntrySchema = z.object({
  /** Credential kind Pi stores for the provider; only API keys authorize the usage endpoint. */
  type: z.literal("api_key"),
  /** API key that must be non-empty for the provider to count as signed in. */
  key: z.string().min(1),
});

export const opencodeAuthFileSchema = z.object({
  /** Pi's OpenCode Go entry; entries for other providers are ignored. */
  [OPENCODE_AUTH_ENTRY_NAME]: opencodeApiKeyEntrySchema,
});

export const opencodeAuthAbsenceSchema = z.looseObject({
  /** Pi's OpenCode Go entry is missing, or it holds no key. */
  [OPENCODE_AUTH_ENTRY_NAME]: z.optional(z.looseObject({ key: z.optional(z.literal("")) })),
});
