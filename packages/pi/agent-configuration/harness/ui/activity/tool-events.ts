import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { readSubActivity, readSubagentMetadata, readSubagentUsage } from "../../activity/parse.ts";
import { type ActivityStatus, activityStore } from "../../activity/store.ts";
import { taskResultFailed } from "../../subagents/result.ts";
import { TASK_TOOL_NAME } from "../../subagents/roles.ts";
import { isHarnessTool } from "../../tools/config.ts";
import { extractText, resultFailed } from "../tool-renderer.ts";

interface RendererContent {
  content?: Array<{ type: string; text?: string }>;
  details?: unknown;
}

function rendererPayload(value: unknown): RendererContent {
  if (!value || typeof value !== "object") return {};
  return value as RendererContent;
}

export function registerToolActivity(
  pi: ExtensionAPI,
  touch: (ctx: ExtensionContext) => void,
  publish: (ctx: ExtensionContext) => void,
): void {
  pi.on("tool_execution_start", (event, ctx) => {
    touch(ctx);
    activityStore.updateAgent({ phase: "working" });
    activityStore.begin({
      id: event.toolCallId,
      toolName: event.toolName,
      args: (event.args ?? {}) as Record<string, unknown>,
      cwd: ctx.cwd,
    });
    publish(ctx);
  });

  pi.on("tool_execution_update", (event, ctx) => {
    touch(ctx);
    const partial = rendererPayload(event.partialResult);
    activityStore.update(event.toolCallId, {
      text: extractText(partial.content ?? []),
      details: partial.details,
      sub: readSubActivity(partial.details),
      usage: readSubagentUsage(partial.details),
      ...readSubagentMetadata(partial.details),
      status: "running",
    });
  });

  pi.on("tool_execution_end", (event, ctx) => {
    touch(ctx);
    const result = rendererPayload(event.result);
    const text = extractText(result.content ?? []);
    const failedTask = event.toolName === TASK_TOOL_NAME && taskResultFailed(result.details);
    const failedHarnessTool = isHarnessTool(event.toolName) && resultFailed(event.toolName, text);
    const status: ActivityStatus = event.isError || failedTask || failedHarnessTool ? "error" : "success";
    activityStore.finish(event.toolCallId, {
      text,
      details: result.details,
      sub: readSubActivity(result.details),
      usage: readSubagentUsage(result.details),
      ...readSubagentMetadata(result.details),
      status,
    });
    publish(ctx);
  });
}
