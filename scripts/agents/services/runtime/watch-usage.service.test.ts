import { describe, expect, test } from "bun:test";
import { SPINNER_LINE_RESET_SEQUENCE, SPINNER_TEXT } from "../../constants/runtime/spinner.constant.ts";
import { HIDE_CURSOR_SEQUENCE, SHOW_CURSOR_SEQUENCE } from "../../constants/runtime/terminal-sequence.constant.ts";
import { WATCH_FAILED_FOOTER_TEXT, WATCH_FOOTER_TEXT } from "../../constants/runtime/watch.constant.ts";
import { createRecordingStream } from "./recording-terminal-stream.test-double.ts";
import { watchUsage } from "./watch-usage.service.ts";
import {
  createWatchFixture,
  DEFAULT_COLUMNS,
  drawFrame,
  FIRST_CARDS,
  FIRST_FRAME,
  FIRST_FRAME_ROWS,
  redrawOver,
  SECOND_CARDS,
  SECOND_FRAME,
} from "./watch-usage.test-double.ts";

const SPINNER_FRAME_LINE = `${SPINNER_LINE_RESET_SEQUENCE}⠋ ${SPINNER_TEXT}`;

describe("watchUsage", () => {
  test("draws the first cards between the hidden and shown cursor sequences", async () => {
    const fixture = createWatchFixture({
      loads: [{ outcome: "cards", text: FIRST_CARDS }],
      quitAfterWaits: 1,
      stderrIsTTY: false,
      columns: DEFAULT_COLUMNS,
      resize: { state: "none" },
    });
    await watchUsage(fixture.input);
    expect(fixture.stdout.writes).toEqual([HIDE_CURSOR_SEQUENCE, drawFrame(FIRST_FRAME), SHOW_CURSOR_SEQUENCE]);
  });

  test("moves the cursor up over the previous frame and redraws the cards in place", async () => {
    const fixture = createWatchFixture({
      loads: [
        { outcome: "cards", text: FIRST_CARDS },
        { outcome: "cards", text: SECOND_CARDS },
      ],
      quitAfterWaits: 2,
      stderrIsTTY: false,
      columns: DEFAULT_COLUMNS,
      resize: { state: "none" },
    });
    await watchUsage(fixture.input);
    expect(fixture.stdout.writes).toEqual([
      HIDE_CURSOR_SEQUENCE,
      drawFrame(FIRST_FRAME),
      redrawOver(FIRST_FRAME_ROWS, SECOND_FRAME),
      SHOW_CURSOR_SEQUENCE,
    ]);
  });

  test("restores the cursor and draws nothing when quit arrives during a refresh that never finishes", async () => {
    const stdout = createRecordingStream({ isTTY: true, columns: DEFAULT_COLUMNS });
    const stderr = createRecordingStream({ isTTY: true, columns: DEFAULT_COLUMNS });
    await watchUsage({
      loadCards: () => new Promise<string>(() => {}),
      stdout,
      stderr,
      wait: async () => {},
      quitRequested: Promise.resolve(),
      footerLine: WATCH_FOOTER_TEXT,
      failedFooterLine: WATCH_FAILED_FOOTER_TEXT,
    });
    expect(stdout.writes).toEqual([HIDE_CURSOR_SEQUENCE, SHOW_CURSOR_SEQUENCE]);
  });

  test("shows the spinner on stderr only while the first refresh loads", async () => {
    const fixture = createWatchFixture({
      loads: [
        { outcome: "cards", text: FIRST_CARDS },
        { outcome: "cards", text: SECOND_CARDS },
      ],
      quitAfterWaits: 2,
      stderrIsTTY: true,
      columns: DEFAULT_COLUMNS,
      resize: { state: "none" },
    });
    await watchUsage(fixture.input);
    expect(fixture.stderr.writes).toEqual([SPINNER_FRAME_LINE, SPINNER_LINE_RESET_SEQUENCE]);
  });
});
