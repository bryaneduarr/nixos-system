export const PROVIDER_ORDER = ["claude", "opencode"] as const;

export const PROVIDER_DISPLAY_NAMES: Readonly<Record<(typeof PROVIDER_ORDER)[number], string>> = {
  claude: "Claude Code",
  opencode: "OpenCode Go",
};
