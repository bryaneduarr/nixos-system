import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { TASK_TOOL_NAME } from "./constants/subagents/roles.constant.ts";
import { HARNESS_TOOLS, WEB_TOOLS } from "./constants/tools/harness-tools.constant.ts";
import { installHarnessPresentation } from "./services/tool-rendering/install-harness-presentation.service.ts";
import { enforceActiveTools } from "./services/tools/enforce-active-tools.service.ts";
import { writeStatusFile } from "./services/tools/write-status-file.service.ts";
import { installSessions } from "./sessions/install.ts";
import { registerSubagentTool } from "./subagents/tool.ts";
import { registerEditTool } from "./tools/edit/edit.tool.ts";
import { registerReadTool } from "./tools/read/read.tool.ts";
import { registerRunTool } from "./tools/run/run.tool.ts";
import { registerSearchTool } from "./tools/search/search.tool.ts";

const ALLOWED_TOOL_SET = new Set<string>([...HARNESS_TOOLS, TASK_TOOL_NAME, ...WEB_TOOLS]);

export default function harnessExtension(pi: ExtensionAPI): void {
  registerSearchTool(pi);
  registerReadTool(pi);
  registerEditTool(pi);
  registerRunTool(pi);

  registerSubagentTool(pi);

  installHarnessPresentation(pi);
  installSessions(pi);

  pi.on("session_start", async () => {
    enforceActiveTools(pi);
    await writeStatusFile(pi);
  });

  pi.on("resources_discover", async () => {
    enforceActiveTools(pi);
  });

  pi.on("before_agent_start", async () => {
    enforceActiveTools(pi);
  });

  pi.on("turn_start", async () => {
    enforceActiveTools(pi);
  });

  pi.on("tool_call", async (event) => {
    if (!ALLOWED_TOOL_SET.has(event.toolName)) {
      const reason = [
        `Tool "${event.toolName}" is not enabled in this session.`,
        "Use the harness tools or the approved local web research tools.",
      ].join(" ");
      return {
        block: true,
        reason,
      };
    }
  });

  pi.registerCommand("harness-status", {
    description: "Show the active harness tools",
    handler: async (_args, ctx) => {
      enforceActiveTools(pi);
      await writeStatusFile(pi);
      const active = pi.getActiveTools();
      const all = pi.getAllTools().map((tool) => tool.name);
      ctx.ui.notify(
        `active: ${active.join(", ")}\nregistered: ${all.join(", ")}\nharness: ${HARNESS_TOOLS.join(", ")}`,
        "info",
      );
    },
  });
}
