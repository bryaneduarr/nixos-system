import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import {
  readAssistantActivity,
  readSubActivity,
  readSubagentMetadata,
  readSubagentUsage,
} from "../../activity/parse.ts";
import { activityStore } from "../../activity/store.ts";
import { TASK_TOOL_NAME } from "../../constants/subagents/roles.constant.ts";
import { taskResultFailed } from "../../subagents/result.ts";
import { isHarnessTool } from "../../services/tools/is-harness-tool.service.ts";
import type { ActivityStatus } from "../../types/activity/activity-status.interface.ts";
import { extractText, resultFailed } from "../tool-renderer.ts";
import { recordThinking, recordUpdate, recordUserMessage, safeParseTimestamp } from "./records.ts";

export function hydrateFromSession(ctx: ExtensionContext): void {
  activityStore.clear();
  const cwd = ctx.cwd;
  for (const entry of ctx.sessionManager.getBranch()) {
    if (entry.type !== "message") continue;
    const message = entry.message as {
      role?: string;
      content?: unknown;
      toolCallId?: unknown;
      toolName?: unknown;
      details?: unknown;
      isError?: unknown;
    };
    const startedAt = safeParseTimestamp(entry.timestamp);
    if (message.role === "user") {
      recordUserMessage(`message-${entry.id}`, message.content, cwd, startedAt);
      continue;
    }

    if (message.role === "assistant" && Array.isArray(message.content)) {
      const trace = readAssistantActivity(message);
      if (trace) {
        recordThinking(`thinking-${entry.id}`, trace.thinking, cwd, startedAt);
        if (trace.hasToolCall && trace.response.trim()) {
          const id = `update-${entry.id}`;
          recordUpdate(id, trace.response, cwd, startedAt);
          activityStore.finish(id, {
            text: trace.response,
            status: "success",
            endedAt: startedAt,
          });
        }
        if (trace.thinking) {
          activityStore.finish(`thinking-${entry.id}`, {
            text: trace.thinking,
            status: "success",
            endedAt: startedAt,
          });
        }
        activityStore.updateAgent({
          phase: "idle",
          thinking: trace.thinking,
          thinkingRedacted: trace.thinkingRedacted,
          response: trace.response,
          updatedAt: startedAt,
        });
      }
      for (const raw of message.content) {
        if (!raw || typeof raw !== "object") continue;
        const part = raw as {
          type?: string;
          id?: string;
          name?: string;
          arguments?: Record<string, unknown>;
        };
        if (part.type !== "toolCall") continue;
        if (typeof part.id !== "string" || typeof part.name !== "string") continue;
        activityStore.begin({
          id: part.id,
          toolName: part.name,
          args: part.arguments ?? {},
          cwd,
          startedAt,
        });
      }
      continue;
    }

    if (message.role !== "toolResult" || typeof message.toolCallId !== "string") {
      continue;
    }
    const id = message.toolCallId;
    const existing = activityStore.get(id);
    const toolName = typeof message.toolName === "string" ? message.toolName : existing?.toolName;
    if (!toolName) continue;
    const text = extractText(
      Array.isArray(message.content) ? (message.content as Array<{ type: string; text?: string }>) : [],
    );
    const failedTask = toolName === TASK_TOOL_NAME && taskResultFailed(message.details);
    const failedHarnessTool = isHarnessTool(toolName) && resultFailed(toolName, text);
    const status: ActivityStatus = message.isError === true || failedTask || failedHarnessTool ? "error" : "success";
    activityStore.begin({
      id,
      toolName,
      args: existing?.args ?? {},
      cwd,
      startedAt: existing?.startedAt ?? startedAt,
    });
    activityStore.finish(id, {
      text,
      details: message.details,
      sub: readSubActivity(message.details),
      usage: readSubagentUsage(message.details),
      ...readSubagentMetadata(message.details),
      status,
      endedAt: startedAt,
    });
  }
}
