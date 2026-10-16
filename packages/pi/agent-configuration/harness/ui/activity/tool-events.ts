import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Value } from "typebox/value";
import { readSubActivity, readSubagentMetadata, readSubagentUsage } from "../../activity/parse.ts";
import { activityStore } from "../../activity/store.ts";
import { TASK_TOOL_NAME } from "../../constants/subagents/roles.constant.ts";
import { RendererPayloadSchema } from "../../schemas/activity/renderer-payload.schema.ts";
import { resultFailed } from "../../services/tool-rendering/presentation/result-failed.service.ts";
import { extractText } from "../../services/tool-rendering/text/extract-text.service.ts";
import { isHarnessTool } from "../../services/tools/is-harness-tool.service.ts";
import { taskResultFailed } from "../../subagents/result.ts";
import type { ActivityStatus } from "../../types/activity/activity-status.interface.ts";
import type { RendererResult } from "../../types/activity/renderer-result.interface.ts";

function rendererResult(value: unknown): RendererResult {
  if (!Value.Check(RendererPayloadSchema, value)) return { text: "", details: undefined };
  return { text: extractText(value.content ?? []), details: value.details };
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
    const partial = rendererResult(event.partialResult);
    activityStore.update(event.toolCallId, {
      text: partial.text,
      details: partial.details,
      sub: readSubActivity(partial.details),
      usage: readSubagentUsage(partial.details),
      ...readSubagentMetadata(partial.details),
      status: "running",
    });
  });

  pi.on("tool_execution_end", (event, ctx) => {
    touch(ctx);
    const result = rendererResult(event.result);
    const failedTask = event.toolName === TASK_TOOL_NAME && taskResultFailed(result.details);
    const failedHarnessTool = isHarnessTool(event.toolName) && resultFailed(event.toolName, result.text);
    const status: ActivityStatus = event.isError || failedTask || failedHarnessTool ? "error" : "success";
    activityStore.finish(event.toolCallId, {
      text: result.text,
      details: result.details,
      sub: readSubActivity(result.details),
      usage: readSubagentUsage(result.details),
      ...readSubagentMetadata(result.details),
      status,
    });
    publish(ctx);
  });
}
