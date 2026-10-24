import type { SessionReportSource } from "../../../../types/sessions/herdr/pane/session-report-source.interface.ts";
import type { SessionReport } from "../../../../types/sessions/monitor/session-report.interface.ts";

export async function reportSessionIfChanged(report: SessionReport): Promise<void> {
  const { session, row, ctx } = report;
  const path = ctx.sessionManager.getSessionFile();
  const source: SessionReportSource = path ? { kind: "file", path } : { kind: "identifier" };
  const keyPrefix = `${row.sessionId}:${row.status}:`;
  const reportKey = source.kind === "file" ? `${keyPrefix}${source.path}` : keyPrefix;
  const isAlreadyReported = session.reported.state === "present" && session.reported.value === reportKey;
  if (isAlreadyReported) return;
  await session.herdr.report(row, source);
  session.reported = { state: "present", value: reportKey };
}
