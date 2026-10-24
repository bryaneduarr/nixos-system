import { expect, test } from "bun:test";
import {
  backgroundAnsi,
  getTerminalColorMode,
  parseColor,
  stripTerminalSequences,
  visibleWidth,
} from "@earendil-works/pi-tui";
import { renderInputCard } from "./render-input-card.service.ts";
import { renderMessageCard } from "./render-message-card.service.ts";

const cardWidth = 30;
const plain = (lines: readonly string[]): string[] => lines.map(stripTerminalSequences);

test("a user card has rounded borders, a lowercase title, and lines of equal width", () => {
  const lines = renderMessageCard("user", cardWidth, () => ["", "hello there", ""]);
  expect(plain(lines)).toEqual([
    "╭─ user ─────────────────────╮",
    "│ hello there                │",
    "╰────────────────────────────╯",
  ]);
  expect(lines.every((line) => visibleWidth(line) === cardWidth)).toBe(true);
});

test("a user card fills every row with a background that survives resets in the content", () => {
  const lines = renderMessageCard("user", cardWidth, () => ["\x1b[1mbold\x1b[0m after"]);
  const backgroundStart = backgroundAnsi(parseColor("#292d42"), getTerminalColorMode());
  expect(lines.every((line) => line.startsWith(backgroundStart))).toBe(true);
  expect(lines[1]).toContain(`\x1b[0m${backgroundStart} after`);
});

test("an agent card leaves the terminal background alone", () => {
  const lines = renderMessageCard("agent", cardWidth, () => ["answer"]);
  expect(lines.some((line) => line.includes("\x1b[48"))).toBe(false);
});

test("an agent card renders its content at the width inside the border", () => {
  const widths: number[] = [];
  const lines = renderMessageCard("agent", cardWidth, (contentWidth) => {
    widths.push(contentWidth);
    return ["answer"];
  });
  expect(widths).toEqual([cardWidth - 4]);
  expect(plain(lines)[0]).toStartWith("╭─ agent ");
});

test("a thinking card has the same dashed frame as a tool box", () => {
  const lines = renderMessageCard("thinking", cardWidth, () => ["weighing options"]);
  expect(plain(lines)).toEqual([
    "+-- thinking ----------------+",
    "| weighing options           |",
    "+----------------------------+",
  ]);
  expect(lines.every((line) => visibleWidth(line) === cardWidth)).toBe(true);
});

test("a message with only blank lines draws no card", () => {
  expect(renderMessageCard("agent", cardWidth, () => ["", "  "])).toEqual([]);
});

test("a message card gives way to plain content when the width is too small", () => {
  expect(renderMessageCard("user", 6, (contentWidth) => [`w${contentWidth}`])).toEqual(["w6"]);
});

test("the input card replaces the editor borders and keeps lines below the editor", () => {
  const editorBorder = "─".repeat(26);
  const lines = renderInputCard(cardWidth, () => [
    editorBorder,
    "typed text",
    "second line",
    editorBorder,
    "autocomplete",
  ]);
  expect(plain(lines)).toEqual([
    "╭─ input ────────────────────╮",
    "│ typed text                 │",
    "│ second line                │",
    "╰────────────────────────────╯",
    "autocomplete",
  ]);
});

test("an empty editor still draws one input row", () => {
  const editorBorder = "─".repeat(26);
  const lines = renderInputCard(cardWidth, () => [editorBorder, editorBorder]);
  expect(plain(lines)).toHaveLength(3);
});
