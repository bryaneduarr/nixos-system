export const HERDR_PANE = "pane";

const HERDR_TAB = "tab";

const HERDR_AGENT = "agent";

const HERDR_NOTIFICATION = "notification";

const HERDR_REPORT_AGENT = "report-agent";

const HERDR_REPORT_AGENT_SESSION = "report-agent-session";

const HERDR_RELEASE_AGENT = "release-agent";

export const SILENT_HERDR_COMMANDS: ReadonlySet<string> = new Set([
  HERDR_REPORT_AGENT,
  HERDR_REPORT_AGENT_SESSION,
  HERDR_RELEASE_AGENT,
]);

export const HERDR_PANE_CURRENT: readonly string[] = [HERDR_PANE, "current", "--current"];

export const HERDR_PANE_GET: readonly string[] = [HERDR_PANE, "get"];

export const HERDR_TAB_GET: readonly string[] = [HERDR_TAB, "get"];

export const HERDR_PANE_PROCESS_INFO: readonly string[] = [HERDR_PANE, "process-info", "--pane"];

export const HERDR_PANE_LAYOUT: readonly string[] = [HERDR_PANE, "layout", "--pane"];

export const HERDR_PANE_SPLIT: readonly string[] = [HERDR_PANE, "split", "--pane"];

export const HERDR_PANE_RENAME: readonly string[] = [HERDR_PANE, "rename"];

export const HERDR_PANE_CLOSE: readonly string[] = [HERDR_PANE, "close"];

export const HERDR_PANE_RELEASE_AGENT: readonly string[] = [HERDR_PANE, HERDR_RELEASE_AGENT];

export const HERDR_PANE_REPORT_AGENT: readonly string[] = [HERDR_PANE, HERDR_REPORT_AGENT];

export const HERDR_PANE_REPORT_AGENT_SESSION: readonly string[] = [HERDR_PANE, HERDR_REPORT_AGENT_SESSION];

export const HERDR_AGENT_RENAME: readonly string[] = [HERDR_AGENT, "rename"];

export const HERDR_AGENT_START: readonly string[] = [HERDR_AGENT, "start"];

export const HERDR_AGENT_FOCUS: readonly string[] = [HERDR_AGENT, "focus"];

export const HERDR_NOTIFICATION_SHOW: readonly string[] = [HERDR_NOTIFICATION, "show"];

export const HERDR_SOURCE_FLAG = "--source";

export const HERDR_AGENT_FLAG = "--agent";

export const HERDR_SEQUENCE_FLAG = "--seq";

export const HERDR_STATE_FLAG = "--state";

export const HERDR_BODY_FLAG = "--body";

export const HERDR_SOUND_FLAG = "--sound";

export const HERDR_DIRECTION_FLAG = "--direction";

export const HERDR_CWD_FLAG = "--cwd";

export const HERDR_ENV_FLAG = "--env";

export const HERDR_NO_FOCUS_FLAG = "--no-focus";

export const HERDR_KIND_FLAG = "--kind";

export const HERDR_PANE_FLAG = "--pane";

export const HERDR_TIMEOUT_FLAG = "--timeout";

export const HERDR_SESSION_PATH_FLAG = "--agent-session-path";

export const HERDR_SESSION_ID_FLAG = "--agent-session-id";

export const DEFAULT_HERDR_BINARY = "herdr";
