import { expect, test } from "bun:test";
import { stripTerminalSequences, visibleWidth } from "@earendil-works/pi-tui";
import { renderTurnDivider } from "./render-turn-divider.service.ts";

const plainTheme = { fg: (_color: string, text: string): string => text };
function readFirstLine(lines: readonly string[]): string {
  const [line] = lines;
  if (line === undefined) throw new Error("Expected the divider to have a line.");
  return line;
}

const markedTheme = { fg: (color: string, text: string): string => `<${color}>${text}</${color}>` };

test("the earlier divider fills the width and leaves a blank line below", () => {
  const lines = renderTurnDivider(plainTheme, { direction: "earlier", hiddenCount: 3, width: 60 });
  expect(lines).toHaveLength(2);
  expect(visibleWidth(readFirstLine(lines))).toBe(60);
  expect(lines[0]).toContain("↑ 3 earlier turns hidden · Alt+H show");
  expect(lines[1]).toBe("");
});

test("the later divider is a single line pointing down", () => {
  const lines = renderTurnDivider(plainTheme, { direction: "later", hiddenCount: 1, width: 60 });
  expect(lines).toHaveLength(1);
  expect(lines[0]).toContain("↓ 1 later turn hidden · Alt+H show");
});

test("the dashes, wording, and shortcut use different colors", () => {
  const line = readFirstLine(renderTurnDivider(markedTheme, { direction: "later", hiddenCount: 2, width: 60 }));
  expect(line).toContain("<muted>╌");
  expect(line).toContain("<accent>↓ 2 later turns hidden</accent>");
  expect(line).toContain("<warning>Alt+H show</warning>");
});

test("a narrow transcript keeps only the summary within the width", () => {
  const line = readFirstLine(renderTurnDivider(plainTheme, { direction: "earlier", hiddenCount: 12, width: 14 }));
  expect(visibleWidth(stripTerminalSequences(line))).toBeLessThanOrEqual(14);
});
