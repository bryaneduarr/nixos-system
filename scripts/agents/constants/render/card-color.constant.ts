import type { BarLevel } from "../../types/render/usage-bar.interface.ts";
import type { MessageUsageStatus } from "../../types/render/usage-card.interface.ts";
import type { ProviderId } from "../../types/usage/provider-usage.interface.ts";

export const ANSI_ESCAPE = "\u001b";

export const ANSI_RESET_SEQUENCE = `${ANSI_ESCAPE}[0m`;

export const ANSI_SGR_PATTERN = new RegExp(`${ANSI_ESCAPE}\\[[0-9;]*m`, "g");

export const DIM_SGR = "2";

export const PROVIDER_ACCENT_SGR: Readonly<Record<ProviderId, string>> = {
  claude: "38;5;208",
  opencode: "38;5;135",
};

export const BAR_LEVEL_SGR: Readonly<Record<BarLevel, string>> = {
  green: "32",
  yellow: "33",
  red: "31",
};

export const MESSAGE_STATUS_SGR: Readonly<Record<MessageUsageStatus, string>> = {
  "not-signed-in": DIM_SGR,
  "login-expired": "33",
  error: "31",
};
