import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { readAssistantActivity } from "../../activity/parse.ts";
import { activityStore } from "../../activity/store.ts";
import { MESSAGE_ACTIVITY_NAME, UPDATE_ACTIVITY_NAME } from "../../constants/activity/activity-entry.constant.ts";
import {
  ACTIVITY_COMPLETION_ENTRY,
  ACTIVITY_SUMMARY_ENTRY,
  ACTIVITY_WIDGET_KEY,
} from "../../constants/activity/activity-keys.constant.ts";
import { SPINNER_TICK_MS } from "../../constants/activity/spinner.constant.ts";
import { INSPECT_SHORTCUT } from "../../constants/tool-rendering/inspect-shortcut.constant.ts";
import { openInspector } from "../../services/inspector/open/open-inspector.service.ts";
import { inspectRequestStore } from "../../services/inspector/request/inspect-request-store.service.ts";
import { hydrateFromSession } from "./hydrate.ts";
import { recordThinking, recordUpdate, recordUserMessage } from "./records.ts";
import { restoreCompletions } from "./restore.ts";
import { renderActivitySummary } from "./summary.ts";
import { clearActivityCompletions, setActivityCompletion, setActivitySummaryState } from "./summary-state.ts";
import { registerToolActivity } from "./tool-events.ts";
import { resetActivityVisibility, setAgentWorking, toggleActivityVisibility } from "./visibility.ts";

function phaseForAssistantEvent(eventType: string, hasToolCall: boolean): "thinking" | "working" | "responding" {
  if (eventType === "start" || eventType.startsWith("thinking")) return "thinking";
  if (eventType.startsWith("toolcall") || hasToolCall) return "working";
  return "responding";
}

export function installActivity(pi: ExtensionAPI): void {
  pi.registerEntryRenderer(ACTIVITY_SUMMARY_ENTRY, () => {
    // Older sessions stored a summary in the transcript. Its live replacement
    // is an editor widget, so keep these entries invisible on reload.
    return undefined;
  });
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
  const publish = (ctx: ExtensionContext): void => {
    if (ctx.mode !== "tui") return;
    setActivitySummaryState(working, frame);
    const messageNumber = activityStore.all().filter((entry) => entry.toolName === MESSAGE_ACTIVITY_NAME).length;
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
  let thinkingId: string | undefined;
  let updateId: string | undefined;
  let thinkingSequence = 0;
  let messageSequence = 0;

  inspectRequestStore.setOpener((ctx, selection) => {
    void openInspector(ctx, selection);
  });

  const touch = (ctx: ExtensionContext): void => {
    currentContext = ctx;
    inspectRequestStore.setContext(ctx);
    publish(ctx);
  };

  pi.on("session_start", (_event, ctx) => {
    resetActivityVisibility();
    if (ctx.mode === "tui") ctx.ui.setHiddenThinkingLabel("");
    thinkingId = undefined;
    updateId = undefined;
    hydrateFromSession(ctx);
    clearActivityCompletions();
    working = false;
    frame = 0;
    setActivitySummaryState(working, frame);
    stopTicker();
    restoreCompletions(ctx);
    touch(ctx);
  });

  pi.on("agent_start", (_event, ctx) => {
    setAgentWorking(true);
    working = true;
    touch(ctx);
    startTicker();
    activityStore.updateAgent({
      phase: "thinking",
      thinking: "",
      thinkingRedacted: false,
      response: "",
    });
  });

  pi.on("message_start", (event, ctx) => {
    if (event.message.role === "user") {
      recordUserMessage(`message-live-${++messageSequence}`, event.message.content, ctx.cwd, Date.now());
      publish(ctx);
      return;
    }
    if (!readAssistantActivity(event.message)) return;
    thinkingId = `thinking-live-${++thinkingSequence}`;
    updateId = `update-live-${thinkingSequence}`;
  });

  pi.on("message_update", (event, ctx) => {
    const trace = readAssistantActivity(event.message);
    if (!trace) return;
    if (thinkingId) recordThinking(thinkingId, trace.thinking, ctx.cwd, Date.now());
    if (updateId && trace.hasToolCall) recordUpdate(updateId, trace.response, ctx.cwd, Date.now());
    touch(ctx);
    activityStore.updateAgent({
      phase: phaseForAssistantEvent(event.assistantMessageEvent.type, trace.hasToolCall),
      thinking: trace.thinking,
      thinkingRedacted: trace.thinkingRedacted,
      response: trace.response,
    });
  });

  pi.on("message_end", (event, ctx) => {
    touch(ctx);
    const trace = readAssistantActivity(event.message);
    if (!trace) return;
    if (thinkingId && trace.thinking) {
      recordThinking(thinkingId, trace.thinking, ctx.cwd, Date.now());
      activityStore.finish(thinkingId, {
        text: trace.thinking,
        status: "success",
      });
    }
    thinkingId = undefined;
    if (updateId && trace.hasToolCall && trace.response.trim()) {
      recordUpdate(updateId, trace.response, ctx.cwd, Date.now());
      activityStore.finish(updateId, {
        text: trace.response,
        status: "success",
      });
    }
    updateId = undefined;
    publish(ctx);
    activityStore.updateAgent({
      phase: trace.hasToolCall ? "working" : "responding",
      thinking: trace.thinking,
      thinkingRedacted: trace.thinkingRedacted,
      response: trace.response,
    });
  });

  registerToolActivity(pi, touch, publish);

  pi.on("agent_settled", (_event, ctx) => {
    touch(ctx);
    setAgentWorking(false);
    working = false;
    stopTicker();
    const messageNumber = activityStore.all().filter((entry) => entry.toolName === MESSAGE_ACTIVITY_NAME).length;
    if (messageNumber > 0) {
      const completedAt = Date.now();
      setActivityCompletion(messageNumber, completedAt);
      pi.appendEntry(ACTIVITY_COMPLETION_ENTRY, {
        messageNumber,
        completedAt,
      });
    }
    activityStore.updateAgent({ phase: "idle" });
    publish(ctx);
  });

  pi.registerShortcut("alt+v", {
    description: "Show or hide harness tool history",
    handler: (ctx) => {
      toggleActivityVisibility();
      publish(ctx);
    },
  });

  pi.on("session_shutdown", (_event, ctx) => {
    stopTicker();
    working = false;
    setActivitySummaryState(working, frame);
    currentContext = undefined;
    ctx.ui.setWidget(ACTIVITY_WIDGET_KEY, undefined);
    resetActivityVisibility();
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
