import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { renderActivitySummary } from "../../../components/activity/summary.component.ts";
import { ACTIVITY_WIDGET_KEY } from "../../../constants/activity/events/activity-keys.constant.ts";
import { SPINNER_TICK_MS } from "../../../constants/activity/summary/spinner.constant.ts";
import { activitySummaryState } from "../../../stores/activity/activity-summary-state.store.ts";
import { inspectRequestStore } from "../../../stores/inspector/inspect-request.store.ts";
import type { ActivityPublisher } from "../../../types/activity/events/activity-publisher.interface.ts";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";
import { countMessageEntries } from "../messages/count-message-entries.service.ts";
import { readTranscriptScroll } from "../summary/state/read-transcript-scroll.service.ts";

export function createActivityPublisher(): ActivityPublisher {
  let currentContext: ValueState<ExtensionContext> = { state: "absent" };
  let working = false;
  let frame = 0;
  let ticker: ValueState<ReturnType<typeof setInterval>> = { state: "absent" };

  const publish = (ctx: ExtensionContext): void => {
    if (ctx.mode !== "tui") return;
    activitySummaryState.setProgress(working, frame);
    const messageNumber = countMessageEntries();
    ctx.ui.setWidget(
      ACTIVITY_WIDGET_KEY,
      messageNumber > 0
        ? (tui, theme) => renderActivitySummary({ messageNumber }, theme, readTranscriptScroll(tui))
        : undefined,
      { placement: "aboveEditor" },
    );
  };
  const stopTicker = (): void => {
    if (ticker.state === "present") clearInterval(ticker.value);
    ticker = { state: "absent" };
  };
  const stopWork = (): void => {
    working = false;
    stopTicker();
    activitySummaryState.setProgress(working, frame);
  };

  return {
    publish,
    touch(ctx) {
      currentContext = { state: "present", value: ctx };
      inspectRequestStore.setContext(ctx);
      publish(ctx);
    },
    setWorking(nextWorking) {
      working = nextWorking;
    },
    startTicker() {
      if (ticker.state === "present") return;
      ticker = {
        state: "present",
        value: setInterval(() => {
          frame++;
          if (currentContext.state === "present") publish(currentContext.value);
        }, SPINNER_TICK_MS),
      };
    },
    resetWork() {
      frame = 0;
      stopWork();
    },
    stopWork,
    close(ctx) {
      stopWork();
      currentContext = { state: "absent" };
      ctx.ui.setWidget(ACTIVITY_WIDGET_KEY, undefined);
    },
  };
}
