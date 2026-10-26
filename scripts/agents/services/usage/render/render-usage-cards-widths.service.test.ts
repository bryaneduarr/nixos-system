import { describe, expect, test } from "bun:test";
import type { ProviderUsage } from "../../../types/usage/provider-usage.interface.ts";
import { measureVisibleLength } from "./measure-visible-length.service.ts";
import { renderUsageCards } from "./render-usage-cards.service.ts";
import {
  boxCard,
  claudeUsage,
  emptyCell,
  emptyUsage,
  filledCell,
  notSignedInUsage,
  now,
  renderPlain,
  unplannedClaudeUsage,
  wideWidth,
} from "./render-usage-cards.test-double.ts";

const minCardWidth = 40;

const minInnerWidth = 36;

const narrowClaudeUsage: ProviderUsage = {
  status: "ok",
  provider: "claude",
  plan: { state: "reported", name: "max" },
  windows: [{ label: "Opus weekly", percentRemaining: 97, resetsAt: "2026-10-28T16:12:00Z" }],
};

const longMessageUsage: ProviderUsage = {
  status: "error",
  provider: "claude",
  message: "Claude usage could not be fetched because the usage endpoint was unreachable.",
};

describe("renderUsageCards widths", () => {
  test("clamps narrow widths to the minimum card width", () => {
    expect(renderPlain([unplannedClaudeUsage], 20)).toBe(renderPlain([unplannedClaudeUsage], minCardWidth));
  });

  test("moves the countdown below the bar and truncates long labels when the row does not fit", () => {
    const labelAndBar = `Opus we…  ${filledCell.repeat(19)}${emptyCell}   97%`;
    const countdownLine = `${" ".repeat(10)}resets in 3d 4h 12m`;
    expect(renderPlain([narrowClaudeUsage], minCardWidth)).toBe(
      boxCard(["Claude Code  max", "", labelAndBar, countdownLine], minInnerWidth),
    );
  });

  test("wraps long messages inside the card", () => {
    expect(renderPlain([longMessageUsage], minCardWidth)).toBe(
      boxCard(
        [
          "Claude Code",
          "",
          "error",
          "Claude usage could not be fetched",
          "because the usage endpoint was",
          "unreachable.",
        ],
        minInnerWidth,
      ),
    );
  });

  test("draws every line of every card at the same visible width", () => {
    const usages = [claudeUsage, unplannedClaudeUsage, notSignedInUsage, emptyUsage];
    for (const width of [minCardWidth, wideWidth]) {
      for (const colorEnabled of [false, true]) {
        const output = renderUsageCards({ usages, now, colorEnabled, width });
        const lines = output.split("\n").filter((line) => line !== "");
        expect([...new Set(lines.map(measureVisibleLength))]).toEqual([width]);
      }
    }
  });
});
