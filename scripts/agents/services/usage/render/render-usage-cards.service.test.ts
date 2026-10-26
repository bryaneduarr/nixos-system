import { describe, expect, test } from "bun:test";
import type { ProviderUsage } from "../../../types/usage/provider-usage.interface.ts";
import { renderUsageCards } from "./render-usage-cards.service.ts";
import {
  boxCard,
  claudeUsage,
  emptyCell,
  emptyUsage,
  errorUsage,
  filledCell,
  loginExpiredUsage,
  notSignedInUsage,
  now,
  renderPlain,
  resetUnknownUsage,
  unplannedClaudeUsage,
  wideInnerWidth,
  wideWidth,
} from "./render-usage-cards.test-double.ts";

function singleWindowUsage(percentRemaining: number): ProviderUsage {
  return {
    status: "ok",
    provider: "claude",
    plan: { state: "unreported" },
    windows: [{ label: "Monthly", percentRemaining, resetsAt: "2026-10-28T16:12:00Z" }],
  };
}

function renderColoredCard(usage: ProviderUsage): string {
  return renderUsageCards({ usages: [usage], now, colorEnabled: true, width: wideWidth });
}

describe("renderUsageCards", () => {
  test("draws an ok card with every window aligned and the plan in the title", () => {
    const sessionRow = `Session      ${filledCell.repeat(19)}${emptyCell}   97%  resets in 4h 12m`;
    const weeklyRow = `Weekly       ${filledCell.repeat(10)}${emptyCell.repeat(10)}   50%  resets in 3d 4h 12m`;
    const opusRow = `Opus weekly  ${emptyCell.repeat(20)}    0%  resets in 23h 59m`;
    expect(renderPlain([claudeUsage])).toBe(
      boxCard(["Claude Code  max", "", sessionRow, weeklyRow, opusRow], wideInnerWidth),
    );
  });

  test("omits the plan from the title when none is reported", () => {
    const weeklyRow = `Weekly  ${filledCell.repeat(16)}${emptyCell.repeat(4)}   80%  resets in 3d 4h 12m`;
    expect(renderPlain([unplannedClaudeUsage])).toBe(boxCard(["Claude Code", "", weeklyRow], wideInnerWidth));
  });

  test("shows the status word and message inside the card for each failure", () => {
    expect(renderPlain([notSignedInUsage])).toBe(
      boxCard(
        ["Claude Code", "", "not signed in", "Sign in to Claude Code by running `claude login`."],
        wideInnerWidth,
      ),
    );
    expect(renderPlain([loginExpiredUsage])).toBe(
      boxCard(
        ["Claude Code", "", "login expired", "Claude Code login expired. Sign in again by running `claude`."],
        wideInnerWidth,
      ),
    );
    expect(renderPlain([errorUsage])).toBe(
      boxCard(["OpenCode Go", "", "error", "OpenCode Go usage request failed with HTTP 500."], wideInnerWidth),
    );
  });

  test("shows no limits reported for an ok card without windows", () => {
    expect(renderPlain([emptyUsage])).toBe(boxCard(["Claude Code", "", "no limits reported"], wideInnerWidth));
  });

  test("shows reset time unknown when the reset timestamp is invalid", () => {
    const rollingRow = `Rolling  ${filledCell.repeat(20)}  100%  reset time unknown`;
    expect(renderPlain([resetUnknownUsage])).toBe(boxCard(["OpenCode Go", "", rollingRow], wideInnerWidth));
  });

  test("separates cards with one blank line", () => {
    const emptyCard = boxCard(["Claude Code", "", "no limits reported"], wideInnerWidth);
    const rollingRow = `Rolling  ${filledCell.repeat(20)}  100%  reset time unknown`;
    const rollingCard = boxCard(["OpenCode Go", "", rollingRow], wideInnerWidth);
    expect(renderPlain([emptyUsage, resetUnknownUsage])).toBe(`${emptyCard}\n\n${rollingCard}`);
  });

  test("colors each bar by the whole percent shown on the card", () => {
    for (const percentRemaining of [49.5, 50.4]) {
      const output = renderColoredCard(singleWindowUsage(percentRemaining));
      expect(output).toContain("50%");
      expect(output).toContain(`\u001b[33m${filledCell.repeat(10)}`);
      expect(output).not.toContain("\u001b[32m");
    }
  });

  test("colors the bar green once the rounded percent exceeds 50", () => {
    const output = renderColoredCard(singleWindowUsage(50.5));
    expect(output).toContain("51%");
    expect(output).toContain(`\u001b[32m${filledCell.repeat(10)}`);
  });

  test("writes no escapes when color is disabled", () => {
    const output = renderPlain([
      claudeUsage,
      unplannedClaudeUsage,
      notSignedInUsage,
      loginExpiredUsage,
      errorUsage,
      emptyUsage,
    ]);
    expect(output).not.toContain("\u001b");
  });

  test("paints the border and title with the provider accent when color is enabled", () => {
    const output = renderUsageCards({ usages: [claudeUsage], now, colorEnabled: true, width: wideWidth });
    expect(output.startsWith("\u001b[38;5;208m╭")).toBe(true);
    expect(output).toContain("\u001b[38;5;208mClaude Code  max\u001b[0m");
  });
});
