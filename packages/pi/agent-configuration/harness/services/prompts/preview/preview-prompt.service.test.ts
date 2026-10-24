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

function renderPreview(text: string, width: number): string[] {
  const component = new Markdown(text, 1, 0, markdownTheme, undefined, {
    preserveOrderedListMarkers: true,
    preserveBackslashEscapes: true,
    transform: (markdown, availableWidth) => previewPrompt(markdown, availableWidth),
  });
  return component.render(width).map((line) => line.trimEnd());
}

test("short prompts are left unchanged", () => {
  expect(previewPrompt("**Hello**", 80)).toBe("**Hello**");
  expect(previewPrompt("first\nsecond\nthird", 80)).toBe("first\nsecond\nthird");
});

test("long prompts show three plain lines ending in dots", () => {
  const text = "first\nsecond\nthird\nfourth";
  expect(previewPrompt(text, 80)).toBe("first\nsecond\nthird...");
  expect(renderPreview(text, 80).filter((line) => line.trim() !== "")).toEqual([" first", " second", " third..."]);
  expect(previewPrompt("word ".repeat(10000), 80).length).toBeLessThan(400);
});

test("punctuation in a truncated prompt is shown without backslashes", () => {
  const text =
    "This is a test prompt on what I\n\nWant to do...\n\nCtrl+Alt+U: For full prompt. | Use /prompts\nfourth";
  const rendered = renderPreview(text, 80).join("\n");
  expect(rendered).toContain("Want to do");
  expect(rendered).not.toContain("\\");
});

test("code and Markdown syntax in a truncated prompt stays plain text", () => {
  const lines = renderPreview("```\n# not a heading\n- not a list\n```\nlast hidden line", 80);
  expect(lines.join("\n")).toContain("```");
  expect(lines.join("\n")).toContain("# not a heading");
  expect(lines.join("\n")).toContain("- not a list...");
  expect(lines.join("\n")).not.toContain("\\");
  expect(lines.join("\n")).not.toContain("last hidden line");
});

test("previews stay within the width for wide characters and narrow terminals", () => {
  for (const width of [10, 20, 40, 80]) {
    const lines = renderPreview(`${"界🙂 word ".repeat(1000)}\nlast hidden line`, width);
    expect(lines.join("\n")).toContain("...");
    expect(lines.join("\n")).not.toContain("last hidden line");
    expect(lines.length).toBeLessThan(25);
    for (const line of lines) expect(visibleWidth(line)).toBeLessThanOrEqual(width);
  }
});
