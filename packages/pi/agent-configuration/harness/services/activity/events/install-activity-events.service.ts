import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
  ACTIVITY_COMPLETION_ENTRY,
  ACTIVITY_SUMMARY_ENTRY,
} from "../../../constants/activity/events/activity-keys.constant.ts";
import { VISIBILITY_SHORTCUT } from "../../../constants/activity/visibility/visibility.constant.ts";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import { activitySummaryState } from "../../../stores/activity/activity-summary-state.store.ts";
import { activityVisibility } from "../../../stores/activity/activity-visibility.store.ts";
import { hydrateFromSession } from "../hydrate/hydrate-from-session.service.ts";
import { restoreCompletions } from "../hydrate/restore-completions.service.ts";
import { countMessageEntries } from "../messages/count-message-entries.service.ts";
import { createActivityPublisher } from "./create-activity-publisher.service.ts";
import { createAssistantMessageRecorder } from "./create-assistant-message-recorder.service.ts";
import { installActivityInspectorEvents } from "./install-activity-inspector-events.service.ts";
import { installAssistantMessageEvents } from "./install-assistant-message-events.service.ts";
import { installToolActivityEvents } from "./install-tool-activity-events.service.ts";

export function installActivityEvents(pi: ExtensionAPI): void {
  const publisher = createActivityPublisher();
  const assistantRecorder = createAssistantMessageRecorder();

  // Older sessions stored a summary in the transcript. Its live replacement
  // is an editor widget, so keep these entries invisible on reload.
  pi.registerEntryRenderer(ACTIVITY_SUMMARY_ENTRY, () => undefined);
  installAssistantMessageEvents(pi, publisher, assistantRecorder);
  installToolActivityEvents(pi, publisher.touch, publisher.publish);
  installActivityInspectorEvents(pi, publisher.touch);

  pi.on("session_start", (_event, ctx) => {
    activityVisibility.reset();
    if (ctx.mode === "tui") ctx.ui.setHiddenThinkingLabel("");
    assistantRecorder.reset();
    hydrateFromSession(ctx);
    activitySummaryState.clearCompletions();
    publisher.resetWork();
    restoreCompletions(ctx);
    publisher.touch(ctx);
  });

  pi.on("agent_start", (_event, ctx) => {
    activityVisibility.setAgentWorking(true);
    publisher.setWorking(true);
    publisher.touch(ctx);
    publisher.startTicker();
    activityStore.setPhase("thinking");
    activityStore.setAssistantText({ thinking: "", thinkingRedacted: false, response: "", updatedAt: Date.now() });
  });

  pi.on("agent_settled", (_event, ctx) => {
    publisher.touch(ctx);
    activityVisibility.setAgentWorking(false);
    publisher.stopWork();
    const messageNumber = countMessageEntries();
    if (messageNumber > 0) {
      const completedAt = Date.now();
      activitySummaryState.setCompletion(messageNumber, completedAt);
      pi.appendEntry(ACTIVITY_COMPLETION_ENTRY, { messageNumber, completedAt });
    }
    activityStore.setPhase("idle");
    publisher.publish(ctx);
  });

  pi.registerShortcut(VISIBILITY_SHORTCUT, {
    description: "Show or hide harness tool history",
    handler: (ctx) => {
      activityVisibility.toggle();
      publisher.publish(ctx);
    },
  });

  pi.on("session_shutdown", (_event, ctx) => {
    publisher.close(ctx);
    activityVisibility.reset();
  });
}
