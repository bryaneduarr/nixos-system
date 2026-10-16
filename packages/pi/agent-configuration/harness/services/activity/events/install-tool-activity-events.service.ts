import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { TASK_TOOL_NAME } from "../../../constants/subagents/roles.constant.ts";
import type { ActivityStatus } from "../../../types/activity/activity-status.interface.ts";
import { taskResultFailed } from "../../subagents/tasks/task-result-failed.service.ts";
import { resultFailed } from "../../tool-rendering/presentation/result-failed.service.ts";
import { isHarnessTool } from "../../tools/is-harness-tool.service.ts";
import { isRecord } from "../parsing/is-record.service.ts";
import { readToolResultFields } from "../parsing/read-tool-result-fields.service.ts";
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
      ...readToolResultFields(partial.details),
      text: partial.text,
      status: { state: "present", value: "running" },
    });
  });

  pi.on("tool_execution_end", (event, ctx) => {
    touch(ctx);
    const result = readRendererResult(event.result);
    const failedTask = event.toolName === TASK_TOOL_NAME && taskResultFailed(result.details);
    const failedHarnessTool = isHarnessTool(event.toolName) && resultFailed(event.toolName, result.text);
    const isErrorResult = event.isError || failedTask || failedHarnessTool;
    const status: ActivityStatus = isErrorResult ? "error" : "success";
    activityStore.finish(event.toolCallId, {
      ...readToolResultFields(result.details),
      text: result.text,
      status,
      endedAt: Date.now(),
    });
    publish(ctx);
  });
}
