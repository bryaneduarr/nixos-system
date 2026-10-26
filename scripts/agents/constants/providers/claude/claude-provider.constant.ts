export const CLAUDE_PROVIDER_ID = "claude";

export const CLAUDE_CREDENTIALS_RELATIVE_PATH = ".claude/.credentials.json";

export const CLAUDE_USAGE_URL = "https://api.anthropic.com/api/oauth/usage";

export const CLAUDE_BETA_HEADER_NAME = "anthropic-beta";

export const CLAUDE_BETA_HEADER_VALUE = "oauth-2025-04-20";

export const CLAUDE_SESSION_KIND = "session";

export const CLAUDE_WEEKLY_KIND = "weekly_all";

export const CLAUDE_WEEKLY_SCOPED_KIND = "weekly_scoped";

export const CLAUDE_SESSION_LABEL = "5-hour";

export const CLAUDE_WEEKLY_LABEL = "Weekly";

export const CLAUDE_SIGN_IN_MESSAGE = "Sign in to Claude Code by running `claude`.";

export const CLAUDE_LOGIN_EXPIRED_MESSAGE = "Claude Code login expired. Sign in again by running `claude`.";

export const CLAUDE_CREDENTIALS_UNREADABLE_MESSAGE =
  "Claude Code credentials could not be read. Sign in again with `claude`.";

export const CLAUDE_USAGE_NETWORK_ERROR_MESSAGE =
  "Claude usage could not be fetched because the usage endpoint was unreachable.";

export const CLAUDE_USAGE_MALFORMED_MESSAGE = "Claude usage response did not match the expected format.";
