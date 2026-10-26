import { describe, expect, test } from "bun:test";
import { HIDE_CURSOR_SEQUENCE, SHOW_CURSOR_SEQUENCE } from "../../constants/runtime/terminal-sequence.constant.ts";
import { watchUsage } from "./watch-usage.service.ts";
import {
  createWatchFixture,
  DEFAULT_COLUMNS,
  drawFrame,
  FAILED_FRAME,
  FAILED_ONLY_FRAME,
  FAILED_ONLY_FRAME_ROWS,
  FIRST_CARDS,
  FIRST_FRAME,
  FIRST_FRAME_ROWS,
  redrawOver,
  SECOND_CARDS,
  SECOND_FRAME,
} from "./watch-usage.test-double.ts";

describe("watchUsage when a refresh fails", () => {
  test("keeps the previous cards under the failed footer and keeps refreshing", async () => {
    const fixture = createWatchFixture({
      loads: [{ outcome: "cards", text: FIRST_CARDS }, { outcome: "throws" }, { outcome: "cards", text: SECOND_CARDS }],
      quitAfterWaits: 3,
      stderrIsTTY: false,
      columns: DEFAULT_COLUMNS,
      resize: { state: "none" },
    });
    await watchUsage(fixture.input);
    expect(fixture.stdout.writes).toEqual([
      HIDE_CURSOR_SEQUENCE,
      drawFrame(FIRST_FRAME),
      redrawOver(FIRST_FRAME_ROWS, FAILED_FRAME),
      redrawOver(FIRST_FRAME_ROWS, SECOND_FRAME),
      SHOW_CURSOR_SEQUENCE,
    ]);
  });

  test("shows only the failed footer when the first refresh fails", async () => {
    const fixture = createWatchFixture({
      loads: [{ outcome: "throws" }],
      quitAfterWaits: 1,
      stderrIsTTY: false,
      columns: DEFAULT_COLUMNS,
      resize: { state: "none" },
    });
    await watchUsage(fixture.input);
    expect(fixture.stdout.writes).toEqual([HIDE_CURSOR_SEQUENCE, drawFrame(FAILED_ONLY_FRAME), SHOW_CURSOR_SEQUENCE]);
  });

  test("replaces the failed footer with the cards once a later refresh succeeds", async () => {
    const fixture = createWatchFixture({
      loads: [{ outcome: "throws" }, { outcome: "cards", text: FIRST_CARDS }],
      quitAfterWaits: 2,
      stderrIsTTY: false,
      columns: DEFAULT_COLUMNS,
      resize: { state: "none" },
    });
    await watchUsage(fixture.input);
    expect(fixture.stdout.writes).toEqual([
      HIDE_CURSOR_SEQUENCE,
      drawFrame(FAILED_ONLY_FRAME),
      redrawOver(FAILED_ONLY_FRAME_ROWS, FIRST_FRAME),
      SHOW_CURSOR_SEQUENCE,
    ]);
  });
});
