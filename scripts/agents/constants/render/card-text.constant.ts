import type { MessageUsageStatus } from "../../types/render/usage-card.interface.ts";

export const MESSAGE_STATUS_WORDS: Readonly<Record<MessageUsageStatus, string>> = {
  "not-signed-in": "not signed in",
  "login-expired": "login expired",
  error: "error",
};

export const NO_LIMITS_REPORTED_TEXT = "no limits reported";

export const RESET_TIME_UNKNOWN_TEXT = "reset time unknown";

export const TITLE_PLAN_SEPARATOR = "  ";
