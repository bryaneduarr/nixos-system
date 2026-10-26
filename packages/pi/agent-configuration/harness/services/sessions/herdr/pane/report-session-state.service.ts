import { PI_AGENT_NAME, PI_HARNESS_SOURCE } from "../../../../constants/sessions/herdr/herdr.constant.ts";
import {
  HERDR_AGENT_FLAG,
  HERDR_PANE_REPORT_AGENT,
  HERDR_PANE_REPORT_AGENT_SESSION,
  HERDR_SEQUENCE_FLAG,
  HERDR_SESSION_ID_FLAG,
  HERDR_SESSION_PATH_FLAG,
  HERDR_SOURCE_FLAG,
  HERDR_STATE_FLAG,
} from "../../../../constants/sessions/herdr/herdr-command.constant.ts";
import type { SessionStateReport } from "../../../../types/sessions/herdr/pane/session-state-report.interface.ts";

export async function reportSessionState(report: SessionStateReport): Promise<void> {
  const { command, nextSequence, row, source } = report;
  const reference =
    source.kind === "file" ? [HERDR_SESSION_PATH_FLAG, source.path] : [HERDR_SESSION_ID_FLAG, row.sessionId];
  const common = [row.pane, HERDR_SOURCE_FLAG, PI_HARNESS_SOURCE, HERDR_AGENT_FLAG, PI_AGENT_NAME, ...reference];
  await command([...HERDR_PANE_REPORT_AGENT_SESSION, ...common, HERDR_SEQUENCE_FLAG, nextSequence()]);
  const state = row.status === "working" ? "working" : "idle";
  await command([...HERDR_PANE_REPORT_AGENT, ...common, HERDR_SEQUENCE_FLAG, nextSequence(), HERDR_STATE_FLAG, state]);
}
