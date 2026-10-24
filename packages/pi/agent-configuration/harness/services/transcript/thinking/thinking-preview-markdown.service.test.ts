import { expect, test } from "bun:test";
import { Markdown, type MarkdownTheme } from "@earendil-works/pi-tui";
import { previewTextLines } from "../preview/preview-text-lines.service.ts";
import { thinkingPreviewMarkdown } from "./thinking-preview-markdown.service.ts";

const keepText = (text: string): string => text;
const plainMarkdownTheme: MarkdownTheme = {
  heading: keepText,
  link: keepText,
  linkUrl: keepText,
  code: keepText,
  codeBlock: keepText,
  codeBlockBorder: keepText,
  quote: keepText,
  quoteBorder: keepText,
  hr: keepText,
  listBullet: keepText,
  bold: keepText,
  italic: keepText,
  strikethrough: keepText,
  underline: keepText,
};

function renderThroughPiMarkdown(thinking: string, width: number): string[] {
  const markdown = new Markdown(
    thinking,
    0,
    0,
    plainMarkdownTheme,
    { color: keepText },
    {
      transform: thinkingPreviewMarkdown,
    },
  );
  return markdown.render(width).map((line) => line.trimEnd());
}

test("thinking renders as a preview without its own title even when it contains Markdown and LaTeX syntax", () => {
  const thinking = [
    "# Plan with *stars*, _underscores_, `code` and [a link](https://example.com)",
    "",
    "- \\[display\\] and \\(inline\\) math, $dollars$, <div>html</div> & ~~strike~~",
    "| table | cell |",
    "-----",
    "a fifth line that stays hidden",
  ].join("\n");

  const rendered = renderThroughPiMarkdown(thinking, 60);
  expect(rendered).toEqual(previewTextLines(thinking, 60));
  expect(rendered).not.toContain("THINKING");
  expect(rendered.some((line) => /[╭╰┌└│]/.test(line))).toBe(false);
});

test("thinking preview reports the lines it hides", () => {
  const thinking = ["one", "two", "three", "four", "five"].join("\n");

  expect(renderThroughPiMarkdown(thinking, 40)).toContainEqual(expect.stringContaining("... 2 more lines"));
});
