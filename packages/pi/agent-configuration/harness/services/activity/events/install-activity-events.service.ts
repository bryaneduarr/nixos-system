import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { renderActivitySummary } from "../../../components/activity/summary.component.ts";
import { UPDATE_ACTIVITY_NAME } from "../../../constants/activity/activity-entry.constant.ts";
import {
  ACTIVITY_COMPLETION_ENTRY,
  ACTIVITY_SUMMARY_ENTRY,
  ACTIVITY_WIDGET_KEY,
} from "../../../constants/activity/activity-keys.constant.ts";
import { SPINNER_TICK_MS } from "../../../constants/activity/spinner.constant.ts";
import { VISIBILITY_SHORTCUT } from "../../../constants/activity/visibility.constant.ts";
import { INSPECT_SHORTCUT } from "../../../constants/tool-rendering/inspect-shortcut.constant.ts";
import type { AgentActivityPhase } from "../../../types/activity/agent-activity.interface.ts";
import type { AssistantActivityLookup } from "../../../types/activity/assistant-activity-lookup.interface.ts";
import { openInspector } from "../../../ui/inspector/index.ts";
import { setInspectContext, setInspectOpener } from "../../../ui/inspector/request.ts";
import { countMessageEntries } from "../history/count-message-entries.service.ts";
import { hydrateFromSession } from "../history/hydrate-from-session.service.ts";
import { recordUserMessage } from "../history/record-user-message.service.ts";
import { restoreCompletions } from "../history/restore-completions.service.ts";
import { activityStore } from "../store/shared-activity-store.service.ts";
import { activitySummaryState } from "../summary/shared-activity-summary-state.service.ts";
import { activityVisibility } from "../visibility/shared-activity-visibility.service.ts";
import { createAssistantMessageRecorder } from "./create-assistant-message-recorder.service.ts";
import { installToolActivityEvents } from "./install-tool-activity-events.service.ts";
import { phaseForAssistantEvent } from "./phase-for-assistant-event.service.ts";

export function installActivityEvents(pi: ExtensionAPI): void {
  // Older sessions stored a summary in the transcript. Its live replacement
  // is an editor widget, so keep these entries invisible on reload.
  pi.registerEntryRenderer(ACTIVITY_SUMMARY_ENTRY, () => undefined);
  pi.registerMarkdownTransformer((markdown, context) => {
    if (context.messageType === "assistant-thinking") return "";
    if (context.messageType !== "assistant") return markdown;
    // Pi's transformer has no message ID or stop reason. Keep streaming text
    // out of the transcript until we know whether this turn calls a tool.
    if (context.isStreaming) return "";
    return activityStore
      .all()
      .some((entry) => entry.toolName === UPDATE_ACTIVITY_NAME && entry.text.trim() === markdown.trim())
      ? ""
      : markdown;
  });

  let currentContext: ExtensionContext | undefined;
  let working = false;
  let frame = 0;
  let ticker: ReturnType<typeof setInterval> | undefined;
  let userMessageSequence = 0;
  const assistantRecorder = createAssistantMessageRecorder();

  const publish = (ctx: ExtensionContext): void => {
    if (ctx.mode !== "tui") return;
    activitySummaryState.setProgress(working, frame);
    const messageNumber = countMessageEntries();
    ctx.ui.setWidget(
      ACTIVITY_WIDGET_KEY,
      messageNumber > 0 ? (_tui, theme) => renderActivitySummary({ messageNumber }, theme) : undefined,
      { placement: "aboveEditor" },
    );
  };
  const stopTicker = (): void => {
    if (ticker !== undefined) clearInterval(ticker);
    ticker = undefined;
  };
  const startTicker = (): void => {
    if (ticker !== undefined) return;
    ticker = setInterval(() => {
      frame++;
      if (currentContext) publish(currentContext);
    }, SPINNER_TICK_MS);
  };
  const touch = (ctx: ExtensionContext): void => {
    currentContext = ctx;
    setInspectContext(ctx);
    publish(ctx);
  };
  const publishAssistantText = (trace: AssistantActivityLookup, phase: AgentActivityPhase): void => {
    if (!trace.found) return;
    activityStore.setPhase(phase);
    activityStore.setAssistantText({
      thinking: trace.snapshot.thinking,
      thinkingRedacted: trace.snapshot.thinkingRedacted,
      response: trace.snapshot.response,
      updatedAt: Date.now(),
    });
  };

  setInspectOpener((ctx, selection) => {
    void openInspector(ctx, selection);
  });

  pi.on("session_start", (_event, ctx) => {
    activityVisibility.reset();
    if (ctx.mode === "tui") ctx.ui.setHiddenThinkingLabel("");
    assistantRecorder.reset();
    hydrateFromSession(ctx);
    activitySummaryState.clearCompletions();
    working = false;
    frame = 0;
    activitySummaryState.setProgress(working, frame);
    stopTicker();
    restoreCompletions(ctx);
    touch(ctx);
  });

  pi.on("agent_start", (_event, ctx) => {
    activityVisibility.setAgentWorking(true);
    working = true;
    touch(ctx);
    startTicker();
    activityStore.setPhase("thinking");
    activityStore.setAssistantText({ thinking: "", thinkingRedacted: false, response: "", updatedAt: Date.now() });
  });

  pi.on("message_start", (event, ctx) => {
    if (event.message.role === "user") {
      userMessageSequence++;
      recordUserMessage(`message-live-${userMessageSequence}`, event.message.content, ctx.cwd, Date.now());
      publish(ctx);
      return;
    }
    assistantRecorder.start(event.message);
  });

  pi.on("message_update", (event, ctx) => {
    const trace = assistantRecorder.update(event.message, ctx.cwd);
    if (!trace.found) return;
    touch(ctx);
    publishAssistantText(trace, phaseForAssistantEvent(event.assistantMessageEvent.type, trace.snapshot.hasToolCall));
  });

  pi.on("message_end", (event, ctx) => {
    touch(ctx);
    const trace = assistantRecorder.end(event.message, ctx.cwd);
    if (!trace.found) return;
    publish(ctx);
    publishAssistantText(trace, trace.snapshot.hasToolCall ? "working" : "responding");
  });

  installToolActivityEvents(pi, touch, publish);

  pi.on("agent_settled", (_event, ctx) => {
    touch(ctx);
    activityVisibility.setAgentWorking(false);
    working = false;
    stopTicker();
    const messageNumber = countMessageEntries();
    if (messageNumber > 0) {
      const completedAt = Date.now();
      activitySummaryState.setCompletion(messageNumber, completedAt);
      pi.appendEntry(ACTIVITY_COMPLETION_ENTRY, { messageNumber, completedAt });
    }
    activityStore.setPhase("idle");
    publish(ctx);
  });

  pi.registerShortcut(VISIBILITY_SHORTCUT, {
    description: "Show or hide harness tool history",
    handler: (ctx) => {
      activityVisibility.toggle();
      publish(ctx);
    },
  });

  pi.on("session_shutdown", (_event, ctx) => {
    stopTicker();
    working = false;
    activitySummaryState.setProgress(working, frame);
    currentContext = undefined;
    ctx.ui.setWidget(ACTIVITY_WIDGET_KEY, undefined);
    activityVisibility.reset();
  });

  pi.registerShortcut(INSPECT_SHORTCUT, {
    description: "Inspect harness tool activity",
    handler: async (ctx) => {
      touch(ctx);
      await openInspector(ctx, { kind: "latest" });
    },
  });

  pi.registerCommand("activity", {
    description: "Inspect agent thinking, tool calls, source read, results, and delegation",
    handler: async (_args, ctx) => {
      touch(ctx);
      await openInspector(ctx, { kind: "latest" });
    },
  });
}
