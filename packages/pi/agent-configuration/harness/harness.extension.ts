import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerHarnessStatusCommand } from "./commands/harness-status/harness-status.command.ts";
import { registerSessionStatsCommand } from "./commands/session-stats/session-stats.command.ts";
import { registerSubagentCancelCommand } from "./commands/subagent-cancel/subagent-cancel.command.ts";
import { registerSubagentStatusCommand } from "./commands/subagent-status/subagent-status.command.ts";
import { installSessions } from "./services/sessions/install/install-sessions.service.ts";
import { installSubagentEvents } from "./services/subagents/events/install-subagent-events.service.ts";
import { installHarnessPresentation } from "./services/tool-rendering/install-harness-presentation.service.ts";
import { installToolEvents } from "./services/tools/active-tools/install-tool-events.service.ts";
import { registerEditTool } from "./tools/edit/edit.tool.ts";
import { registerReadTool } from "./tools/read/read.tool.ts";
import { registerRunTool } from "./tools/run/run.tool.ts";
import { registerSearchTool } from "./tools/search/search.tool.ts";
import { registerTaskTool } from "./tools/task/task.tool.ts";

export default function harnessExtension(pi: ExtensionAPI): void {
  registerSearchTool(pi);
  registerReadTool(pi);
  registerEditTool(pi);
  registerRunTool(pi);

  registerTaskTool(pi);
  registerSubagentStatusCommand(pi);
  registerSubagentCancelCommand(pi);
  installSubagentEvents(pi);

  installHarnessPresentation(pi);
  installSessions(pi);
  installToolEvents(pi);
  registerHarnessStatusCommand(pi);
  registerSessionStatsCommand(pi);
}
