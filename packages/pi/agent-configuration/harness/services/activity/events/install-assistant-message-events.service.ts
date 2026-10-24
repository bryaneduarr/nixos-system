import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import type { ActivityPublisher } from "../../../types/activity/events/activity-publisher.interface.ts";
import type { AssistantMessageRecorder } from "../../../types/activity/events/assistant-message-recorder.interface.ts";
import type { AssistantActivityLookup } from "../../../types/activity/parsing/assistant/assistant-activity-lookup.interface.ts";
import type { AgentActivityPhase } from "../../../types/activity/store/agent-activity-phase.interface.ts";
import { recordUserMessage } from "../record/record-user-message.service.ts";
import { phaseForAssistantEvent } from "./phase-for-assistant-event.service.ts";

export function installAssistantMessageEvents(
  pi: ExtensionAPI,
  publisher: ActivityPublisher,
  assistantRecorder: AssistantMessageRecorder,
): void {
  let userMessageSequence = 0;

  pi.on("message_start", (event, ctx) => {
    if (event.message.role === "user") {
      userMessageSequence++;
      recordUserMessage({
        id: `message-live-${userMessageSequence}`,
        content: event.message.content,
        cwd: ctx.cwd,
        startedAt: Date.now(),
      });
      publisher.publish(ctx);
      return;
    }
    assistantRecorder.start(event.message);
  });

  pi.on("message_update", (event, ctx) => {
    const assistantActivity = assistantRecorder.update(event.message, ctx.cwd);
    if (!assistantActivity.found) return;
    publisher.touch(ctx);
    const phase = phaseForAssistantEvent(event.assistantMessageEvent.type, assistantActivity.snapshot.hasToolCall);
    publishAssistantText(assistantActivity, phase);
  });

  pi.on("message_end", (event, ctx) => {
    publisher.touch(ctx);
    const assistantActivity = assistantRecorder.end(event.message, ctx.cwd);
    if (!assistantActivity.found) return;
    publisher.publish(ctx);
    publishAssistantText(assistantActivity, assistantActivity.snapshot.hasToolCall ? "working" : "responding");
  });
}

function publishAssistantText(assistantActivity: AssistantActivityLookup, phase: AgentActivityPhase): void {
  if (!assistantActivity.found) return;
  activityStore.setPhase(phase);
  activityStore.setAssistantText({
    thinking: assistantActivity.snapshot.thinking,
    thinkingRedacted: assistantActivity.snapshot.thinkingRedacted,
    response: assistantActivity.snapshot.response,
    updatedAt: Date.now(),
  });
}
