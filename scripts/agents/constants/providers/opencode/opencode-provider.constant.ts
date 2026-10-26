export const OPENCODE_PROVIDER_ID = "opencode";

export const OPENCODE_AUTH_RELATIVE_PATH = ".pi/agent/auth.json";

export const OPENCODE_AUTH_ENTRY_NAME = "opencode-go";

export const OPENCODE_USAGE_URL = "https://opencode.ai/zen/go/v1/usage";

export const OPENCODE_ROLLING_WINDOW_NAME = "rolling";

export const OPENCODE_WEEKLY_WINDOW_NAME = "weekly";

export const OPENCODE_MONTHLY_WINDOW_NAME = "monthly";

export const OPENCODE_ROLLING_WINDOW_LABEL = "5-hour";

export const OPENCODE_WEEKLY_WINDOW_LABEL = "Weekly";

export const OPENCODE_MONTHLY_WINDOW_LABEL = "Monthly";

export const OPENCODE_SIGN_IN_MESSAGE = "No OpenCode Go key found. Save one in Pi with /login.";

export const OPENCODE_LOGIN_EXPIRED_MESSAGE =
  "The OpenCode Go key was rejected. Create a new key in OpenCode Console and save it in Pi.";

export const OPENCODE_AUTH_UNREADABLE_MESSAGE =
  "OpenCode Go key could not be read from Pi's auth file. Save the key again in Pi with /login.";

export const OPENCODE_USAGE_NETWORK_ERROR_MESSAGE =
  "OpenCode Go usage could not be fetched because the usage endpoint was unreachable.";

export const OPENCODE_USAGE_MALFORMED_MESSAGE = "OpenCode Go usage response did not match the expected format.";
