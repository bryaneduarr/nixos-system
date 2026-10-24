import { PI_AGENT_NAME, PI_HARNESS_SOURCE } from "../../../../constants/sessions/herdr.constant.ts";
import type { HerdrCommand } from "../../../../types/sessions/herdr/command/herdr-command.interface.ts";
import type { SessionReportSource } from "../../../../types/sessions/herdr/pane/session-report-source.interface.ts";
import type { LiveSession } from "../../../../types/sessions/registry/row/live-session.interface.ts";

export async function reportSessionState(
  command: HerdrCommand,
  nextSequence: () => string,
  row: LiveSession,
  source: SessionReportSource,
): Promise<void> {
  const reference =
    source.kind === "file" ? ["--agent-session-path", source.path] : ["--agent-session-id", row.sessionId];
  const common = [row.pane, "--source", PI_HARNESS_SOURCE, "--agent", PI_AGENT_NAME, ...reference];
  await command(["pane", "report-agent-session", ...common, "--seq", nextSequence()]);
  const state = row.status === "working" ? "working" : "idle";
  await command(["pane", "report-agent", ...common, "--seq", nextSequence(), "--state", state]);
}
