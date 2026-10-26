import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { TASK_TOOL_NAME } from "../../../constants/subagents/roles/roles.constant.ts";
import { HARNESS_TOOLS, WEB_TOOLS } from "../../../constants/tools/active-tools/harness-tools.constant.ts";
import { enforceActiveTools } from "./enforce-active-tools.service.ts";
import { isMcpTool } from "./is-mcp-tool.service.ts";
import { writeStatusFile } from "./write-status-file.service.ts";

const ALLOWED_TOOL_SET = new Set<string>([...HARNESS_TOOLS, TASK_TOOL_NAME, ...WEB_TOOLS]);

export function installToolEvents(pi: ExtensionAPI): void {
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
    const isNestedCall = event.parentToolCallId !== undefined;
    const isAllowedTool = ALLOWED_TOOL_SET.has(event.toolName) || isMcpTool(event.toolName);
    if (!isNestedCall && !isAllowedTool) {
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
}
