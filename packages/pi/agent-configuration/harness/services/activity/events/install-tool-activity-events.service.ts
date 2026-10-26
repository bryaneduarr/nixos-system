import type { ExtensionAPI, ExtensionContext, ToolExecutionStartEvent } from "@earendil-works/pi-coding-agent";
import { BACKEND_TOOLS } from "../../../constants/tools/backends/backend-tools.constant.ts";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import { isRecord } from "../../values/is-record.service.ts";
import { readRendererResult } from "../parsing/tool-result/read-renderer-result.service.ts";
import { readToolResultStatus } from "../parsing/tool-result/read-tool-result-status.service.ts";

const BACKEND_TOOL_NAMES: ReadonlySet<string> = new Set<string>(BACKEND_TOOLS);

function isHiddenBackendCall(event: Pick<ToolExecutionStartEvent, "toolName" | "parentToolCallId">): boolean {
  return event.parentToolCallId !== undefined && BACKEND_TOOL_NAMES.has(event.toolName);
}

export function installToolActivityEvents(
  pi: ExtensionAPI,
  touch: (ctx: ExtensionContext) => void,
  publish: (ctx: ExtensionContext) => void,
): void {
  pi.on("tool_execution_start", (event, ctx) => {
    if (isHiddenBackendCall(event)) return;
    touch(ctx);
    activityStore.setPhase("working");
    activityStore.begin({
      id: event.toolCallId,
      toolName: event.toolName,
      args: isRecord(event.args) ? event.args : {},
      cwd: ctx.cwd,
      startedAt: Date.now(),
    });
    publish(ctx);
  });

  pi.on("tool_execution_update", (event, ctx) => {
    if (isHiddenBackendCall(event)) return;
    touch(ctx);
    const partial = readRendererResult(event.partialResult);
    activityStore.update(event.toolCallId, {
      ...partial.fields,
      text: partial.text,
      status: { state: "present", value: "running" },
    });
  });

  pi.on("tool_execution_end", (event, ctx) => {
    if (isHiddenBackendCall(event)) return;
    touch(ctx);
    const result = readRendererResult(event.result);
    activityStore.finish(event.toolCallId, {
      ...result.fields,
      text: result.text,
      status: readToolResultStatus({
        toolName: event.toolName,
        text: result.text,
        isError: event.isError,
        taskFailed: result.taskFailed,
      }),
      endedAt: Date.now(),
    });
    publish(ctx);
  });
}
