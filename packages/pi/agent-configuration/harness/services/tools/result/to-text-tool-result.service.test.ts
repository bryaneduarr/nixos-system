import { expect, test } from "bun:test";
import { toTextToolResult } from "./to-text-tool-result.service.ts";

test("wraps text in a single text block with empty details", () => {
  expect(toTextToolResult("done")).toEqual({ content: [{ type: "text", text: "done" }], details: {} });
});
