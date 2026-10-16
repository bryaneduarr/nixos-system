import { expect, test } from "bun:test";
import { Markdown, type MarkdownTheme, visibleWidth } from "@earendil-works/pi-tui";
import { previewPrompt } from "./preview-prompt.service.ts";

const identity = (text: string) => text;

const markdownTheme: MarkdownTheme = {
  heading: identity,
  link: identity,
  linkUrl: identity,
  code: identity,
  codeBlock: identity,
  codeBlockBorder: identity,
  quote: identity,
  quoteBorder: identity,
  hr: identity,
  listBullet: identity,
  bold: identity,
  italic: identity,
  strikethrough: identity,
  underline: identity,
};

test("short prompts retain their Markdown and long prompts have a bounded preview", () => {
  expect(previewPrompt("**Hello**", 80)).toBe("**Hello**");
  const text = "first\nsecond\nthird\nfourth";
  const preview = previewPrompt(text, 80);
  expect(preview).toContain("third");
  expect(preview).not.toContain("fourth");
  expect(preview).toContain("... Ctrl+Alt+U");
  expect(text).toBe("first\nsecond\nthird\nfourth");
  expect(previewPrompt("word ".repeat(10000), 80).length).toBeLessThan(400);
});

test("previews account for wrapping, Unicode, narrow widths, and code fences", () => {
  for (const width of [5, 20, 80]) {
    const preview = previewPrompt("界🙂 ".repeat(100), width);
    const lines = preview.split("\n").slice(1, 4);
    for (const line of lines) expect(visibleWidth(line)).toBeLessThanOrEqual(Math.max(2, width - 4));
  }
  expect(previewPrompt("```\na\nb\nc\n```", 80)).toStartWith("````\n");
});

test("real Markdown rendering keeps previews bounded and the hint outside code fences", () => {
  const text = `\`\`\`\n${"界🙂 word ".repeat(1000)}\n\`\`\`\nlast hidden line`;
  const component = new Markdown(text, 1, 1, markdownTheme, undefined, {
    transform: (markdown, width) => previewPrompt(markdown, width),
  });

  for (const width of [10, 40, 80]) {
    component.invalidate();
    const lines = component.render(width);
    expect(lines.join("\n")).toContain("...");
    expect(lines.join("\n")).not.toContain("last hidden line");
    expect(lines.length).toBeLessThan(25);
    for (const line of lines) expect(visibleWidth(line)).toBeLessThanOrEqual(width);
  }
});
