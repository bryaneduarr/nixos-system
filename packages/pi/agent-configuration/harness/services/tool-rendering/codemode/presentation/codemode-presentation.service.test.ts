import { expect, test } from "bun:test";
import type { CodemodeCall } from "../../../../types/tool-rendering/codemode/codemode-call.interface.ts";
import { codemodePresentation } from "./codemode-presentation.service.ts";

const notionFetch: CodemodeCall = {
  name: "mcp__notion__notion_fetch",
  status: "ok",
  durationMs: { state: "present", value: 500 },
};
const script = 'const r = await tools.mcp__notion__notion_search({query: "x"}); return r;';
const header = "Script completed\nWall time 0.6 seconds\nOutput:\n";

test("a running script names what it is doing before any call has been made", () => {
  const presentation = codemodePresentation({ code: script, calls: [], text: "", state: "running" });
  expect(presentation).toEqual({ title: "CODEMODE", target: "Searching notion_search", state: "running", details: [] });
});

test("a finished script summarizes its calls and output without printing the output", () => {
  const text = `${header}{"title":"I want this"}\nsecond line`;
  const presentation = codemodePresentation({ code: script, calls: [notionFetch], text, state: "success" });
  expect(presentation.target).toBe("Reading notion_fetch");
  expect(presentation.details).toEqual(["1 tool call", "✓ notion_fetch 0.5 s", "Output: 2 lines, 35 chars"]);
});

test("a failed script reports the reason and keeps the call rows", () => {
  const failed = { ...notionFetch, status: "error" } satisfies CodemodeCall;
  const text = "Script failed\nWall time 0.1 seconds\nOutput:\nScript error:\nTypeError: boom\n\nmore";
  const presentation = codemodePresentation({ code: "", calls: [failed], text, state: "error" });
  expect(presentation.details).toEqual(["TypeError: boom", "✗ notion_fetch 0.5 s"]);
});

test("a script without tool calls is labeled as a plain script", () => {
  const presentation = codemodePresentation({ code: "return 1", calls: [], text: `${header}1`, state: "success" });
  expect(presentation.target).toBe("Script");
  expect(presentation.details[0]).toBe("no tool calls");
});
