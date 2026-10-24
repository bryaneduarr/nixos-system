import { beforeEach, expect, test } from "bun:test";
import { MESSAGE_ACTIVITY_NAME } from "../../constants/activity/record/activity-entry.constant.ts";
import { activityStore } from "../../stores/activity/activity.store.ts";
import { activitySummaryState } from "../../stores/activity/activity-summary-state.store.ts";
import { activityVisibility } from "../../stores/activity/activity-visibility.store.ts";
import type { TranscriptScroll } from "../../types/activity/summary/transcript-scroll.interface.ts";
import type { SplitViewTheme } from "../../types/split-view/split-view-theme.interface.ts";
import { renderActivitySummary } from "./summary.component.ts";

const TEST_CWD = "/tmp";
const WIDTH = 160;

const atLatest: TranscriptScroll = { isAwayFromLatest: () => false };
const awayFromLatest: TranscriptScroll = { isAwayFromLatest: () => true };

const taggedTheme: Pick<SplitViewTheme, "fg"> = {
  fg: (color, text) => `<${color}>${text}</${color}>`,
};

function beginMessage(): void {
  activityStore.begin({
    id: "message-1",
    toolName: MESSAGE_ACTIVITY_NAME,
    args: { number: 1 },
    cwd: TEST_CWD,
    startedAt: Date.now(),
  });
}

beforeEach(() => {
  activityStore.clear();
  activityVisibility.reset();
  activityVisibility.setAgentWorking(true);
  activitySummaryState.setProgress(true, 0);
});

test("a running tool call sits between the header and footer of the group", () => {
  beginMessage();
  activityStore.begin({ id: "run-1", toolName: "run", args: { command: "cd /tmp" }, cwd: TEST_CWD, startedAt: 0 });

  const [header, toolLine, footer, ...rest] = renderActivitySummary({ messageNumber: 1 }, taggedTheme, atLatest).render(
    WIDTH,
  );

  expect(rest).toEqual([]);
  expect(header).toStartWith("<muted>┌ </muted>");
  expect(header).toContain("<success>");
  expect(toolLine).toStartWith("<muted>│ </muted><accent>");
  expect(toolLine).toContain("cd /tmp");
  expect(footer).toStartWith("<muted>└ </muted>");
});

test("without running tool calls the summary stays on one line", () => {
  beginMessage();

  const lines = renderActivitySummary({ messageNumber: 1 }, taggedTheme, atLatest).render(WIDTH);

  expect(lines).toHaveLength(1);
  expect(lines[0]).toStartWith("<muted>- </muted>");
});

test("scrolling away from the latest message adds the jump hint to the footer", () => {
  beginMessage();

  const lines = renderActivitySummary({ messageNumber: 1 }, taggedTheme, awayFromLatest).render(WIDTH);

  expect(lines).toHaveLength(2);
  expect(lines[1]).toStartWith("<muted>└ </muted>");
  expect(lines[1]).toContain("<warning>Ctrl+End · Jump to latest message</warning>");
});

test("a finished turn shows only the completed label in the success color", () => {
  beginMessage();
  activityStore.begin({ id: "run-1", toolName: "run", args: { command: "cd /tmp" }, cwd: TEST_CWD, startedAt: 0 });
  activitySummaryState.setProgress(false, 0);

  const [header] = renderActivitySummary({ messageNumber: 1 }, taggedTheme, atLatest).render(WIDTH);

  expect(header).toContain("<success>done Completed");
  expect(header).not.toContain("cd /tmp");
});

test("the jump hint is absent while the transcript shows the latest message", () => {
  beginMessage();

  const text = renderActivitySummary({ messageNumber: 1 }, taggedTheme, atLatest).render(WIDTH).join("\n");

  expect(text).not.toContain("Jump to latest message");
});
