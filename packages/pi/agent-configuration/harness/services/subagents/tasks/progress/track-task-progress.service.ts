import type { ToolExecutionEndEvent, ToolExecutionStartEvent } from "@earendil-works/pi-coding-agent";
import { WRITING_RESULT_TASK_LABEL } from "../../../../constants/subagents/tasks/progress/progress.constant.ts";
import type { TrackTaskProgressInput } from "../../../../types/subagents/tasks/progress/track-task-progress-input.interface.ts";
import { isRecord } from "../../../values/is-record.service.ts";
import { textContent } from "../messages/text-content.service.ts";
import { usageFromMessages } from "../messages/usage-from-messages.service.ts";
import { describeToolActivity } from "./describe-tool-activity.service.ts";
import { readContextTokens } from "./read-context-tokens.service.ts";

function startToolCall(input: TrackTaskProgressInput, event: ToolExecutionStartEvent): void {
  const { progress, publish } = input;
  const args = isRecord(event.args) ? event.args : {};
  progress.currentTask = describeToolActivity(event.toolName, args);
  progress.activity = [
    ...progress.activity,
    {
      id: event.toolCallId,
      toolName: event.toolName,
      args,
      status: "running",
      text: "",
      startedAt: Date.now(),
      endedAt: { state: "absent" },
    },
  ];
  publish();
}

function finishToolCall(input: TrackTaskProgressInput, event: ToolExecutionEndEvent): void {
  const { progress, publish } = input;
  const matchingCall = progress.activity.find((toolCall) => toolCall.id === event.toolCallId);
  if (matchingCall) {
    matchingCall.status = event.isError ? "error" : "success";
    matchingCall.text = textContent(isRecord(event.result) ? event.result.content : undefined);
    matchingCall.endedAt = { state: "present", value: Date.now() };
  }

  const runningCall = progress.activity.findLast((toolCall) => toolCall.status === "running");
  progress.currentTask = runningCall
    ? describeToolActivity(runningCall.toolName, runningCall.args)
    : WRITING_RESULT_TASK_LABEL;
  publish();
}

function recordAssistantUsage(input: TrackTaskProgressInput): void {
  const { session, progress, publish } = input;
  progress.usage = {
    usageState: "reported",
    usage: usageFromMessages(session.messages, readContextTokens(session)),
  };
  publish();
}

export function trackTaskProgress(input: TrackTaskProgressInput): () => void {
  return input.session.subscribe((event) => {
    if (event.type === "tool_execution_start") startToolCall(input, event);
    if (event.type === "tool_execution_end") finishToolCall(input, event);
    if (event.type === "message_end" && event.message.role === "assistant") recordAssistantUsage(input);
  });
}
