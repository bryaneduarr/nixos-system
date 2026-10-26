import type { z } from "zod";
import type { claudeOauthCredentialsSchema } from "../../../schemas/providers/claude/claude-credentials.schema.ts";

/** OAuth login fields Claude Code stores, validated before use. */
export type ClaudeOAuthCredentials = Readonly<z.output<typeof claudeOauthCredentialsSchema>>;

/** Result of reading the Claude Code credentials file, discriminated by whether a usable login exists. */
export type ClaudeCredentialRead =
  | {
      /** A usable login with an access token was found. */
      readonly state: "signed-in";
      /** OAuth login fields needed to request usage. */
      readonly credentials: ClaudeOAuthCredentials;
    }
  | {
      /** The credentials file is missing or holds no usable access token. */
      readonly state: "not-signed-in";
    }
  | {
      /** The credentials file exists but cannot be read or does not match the expected format. */
      readonly state: "unreadable";
    };
