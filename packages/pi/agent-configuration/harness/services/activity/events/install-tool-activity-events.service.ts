import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { isRecord } from "../parsing/is-record.service.ts";
import { readToolResultStatus } from "../parsing/read-tool-result-status.service.ts";
import { activityStore } from "../store/shared-activity-store.service.ts";
import { readRendererResult } from "./read-renderer-result.service.ts";

export function installToolActivityEvents(
  pi: ExtensionAPI,
  touch: (ctx: ExtensionContext) => void,
  publish: (ctx: ExtensionContext) => void,
): void {
  pi.on("tool_execution_start", (event, ctx) => {
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
    touch(ctx);
    const partial = readRendererResult(event.partialResult);
    activityStore.update(event.toolCallId, {
      ...partial.fields,
      text: partial.text,
      status: { state: "present", value: "running" },
    });
  });

  pi.on("tool_execution_end", (event, ctx) => {
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
