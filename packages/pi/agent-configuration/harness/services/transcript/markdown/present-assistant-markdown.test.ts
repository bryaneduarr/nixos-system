import { expect, test } from "bun:test";
import { stripTerminalSequences } from "@earendil-works/pi-tui";
import { presentAssistantMarkdown } from "./present-assistant-markdown.service.ts";

const yellowBoldStart = "\x1b[38;2;249;226;175m\x1b[1m";

test("bold text becomes bold yellow and loses its asterisks", () => {
  const presented = presentAssistantMarkdown("Fix **the bug** now");
  expect(presented).toContain(`${yellowBoldStart}the bug`);
  expect(stripTerminalSequences(presented)).toBe("Fix the bug now");
});

test("bold markers inside code spans and fences are left alone", () => {
  const markdown = "use `**raw**` here\n```\n**fenced**\n> [!NEXT] x\n```";
  expect(presentAssistantMarkdown(markdown)).toBe(markdown);
});

test("replies without bold text are unchanged, including callout syntax", () => {
  const markdown = "# Title\n\n- one\n- two\n\n> [!NEXT]\n> plain quote";
  expect(presentAssistantMarkdown(markdown)).toBe(markdown);
});
