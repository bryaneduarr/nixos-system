import { describe, expect, test } from "bun:test";
import { HIDE_CURSOR_SEQUENCE, SHOW_CURSOR_SEQUENCE } from "../../constants/runtime/terminal-sequence.constant.ts";
import { watchUsage } from "./watch-usage.service.ts";
import {
  createWatchFixture,
  DEFAULT_COLUMNS,
  drawFrame,
  FIRST_CARDS,
  FIRST_FRAME,
  FIRST_FRAME_ROWS_AT_NARROW_COLUMNS,
  NARROW_COLUMNS,
  redrawOver,
  SECOND_CARDS,
  SECOND_FRAME,
  WRAPPING_CARDS,
  WRAPPING_FRAME,
  WRAPPING_FRAME_ROWS_AT_NARROW_COLUMNS,
} from "./watch-usage.test-double.ts";

describe("watchUsage row counting", () => {
  test("counts a line wider than the terminal as every row it wraps to", async () => {
    const fixture = createWatchFixture({
      loads: [
        { outcome: "cards", text: WRAPPING_CARDS },
        { outcome: "cards", text: SECOND_CARDS },
      ],
      quitAfterWaits: 2,
      stderrIsTTY: false,
      columns: NARROW_COLUMNS,
      resize: { state: "none" },
    });
    await watchUsage(fixture.input);
    expect(fixture.stdout.writes).toEqual([
      HIDE_CURSOR_SEQUENCE,
      drawFrame(WRAPPING_FRAME),
      redrawOver(WRAPPING_FRAME_ROWS_AT_NARROW_COLUMNS, SECOND_FRAME),
      SHOW_CURSOR_SEQUENCE,
    ]);
  });

  test("counts the previous frame at the terminal width in effect when the redraw happens", async () => {
    const fixture = createWatchFixture({
      loads: [
        { outcome: "cards", text: FIRST_CARDS },
        { outcome: "cards", text: SECOND_CARDS },
      ],
      quitAfterWaits: 2,
      stderrIsTTY: false,
      columns: DEFAULT_COLUMNS,
      resize: { state: "after-first-wait", columns: NARROW_COLUMNS },
    });
    await watchUsage(fixture.input);
    expect(fixture.stdout.writes).toEqual([
      HIDE_CURSOR_SEQUENCE,
      drawFrame(FIRST_FRAME),
      redrawOver(FIRST_FRAME_ROWS_AT_NARROW_COLUMNS, SECOND_FRAME),
      SHOW_CURSOR_SEQUENCE,
    ]);
  });
});
