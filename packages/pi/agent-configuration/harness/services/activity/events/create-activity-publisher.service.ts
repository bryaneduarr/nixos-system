import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { renderActivitySummary } from "../../../components/activity/summary.component.ts";
import { ACTIVITY_WIDGET_KEY } from "../../../constants/activity/activity-keys.constant.ts";
import { SPINNER_TICK_MS } from "../../../constants/activity/spinner.constant.ts";
import type { ActivityPublisher } from "../../../types/activity/activity-publisher.interface.ts";
import { inspectRequestStore } from "../../inspector/request/shared-inspect-request-store.service.ts";
import { countMessageEntries } from "../history/count-message-entries.service.ts";
import { activitySummaryState } from "../summary/shared-activity-summary-state.service.ts";

export function createActivityPublisher(): ActivityPublisher {
  let currentContext: ExtensionContext | undefined;
  let working = false;
  let frame = 0;
  let ticker: ReturnType<typeof setInterval> | undefined;

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
  const stopWork = (): void => {
    working = false;
    stopTicker();
    activitySummaryState.setProgress(working, frame);
  };

  return {
    publish,
    touch(ctx) {
      currentContext = ctx;
      inspectRequestStore.setContext(ctx);
      publish(ctx);
    },
    setWorking(nextWorking) {
      working = nextWorking;
    },
    startTicker() {
      if (ticker !== undefined) return;
      ticker = setInterval(() => {
        frame++;
        if (currentContext) publish(currentContext);
      }, SPINNER_TICK_MS);
    },
    resetWork() {
      frame = 0;
      stopWork();
    },
    stopWork,
    close(ctx) {
      stopWork();
      currentContext = undefined;
      ctx.ui.setWidget(ACTIVITY_WIDGET_KEY, undefined);
    },
  };
}
