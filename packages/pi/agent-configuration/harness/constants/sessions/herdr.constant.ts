export const PI_AGENT_NAME = "pi";

export const PI_HARNESS_SOURCE = "pi:harness";

export const SILENT_HERDR_COMMANDS: ReadonlySet<string> = new Set([
  "report-agent",
  "report-agent-session",
  "release-agent",
]);

export const HERDR_COMMAND_TIMEOUT_MS = 45_000;

export const HERDR_MAX_BUFFER_BYTES = 2 * 1024 * 1024;

export const AGENT_LAUNCH_PENDING_CODE = "agent_launch_pending";

export const PANE_ID_PATTERN = /^w\d+:p\d+$/;

export const TAB_ID_PATTERN = /^w\d+:t\d+$/;

export const WORKSPACE_ID_PATTERN = /^w\d+$/;
