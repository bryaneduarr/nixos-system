import { expect, test } from "bun:test";
import { prepareEditArguments } from "./prepare-edit-arguments.service.ts";

test("keeps a valid operation", () => {
  expect(prepareEditArguments({ op: "delete", path: "a.ts" })).toEqual({ op: "delete", path: "a.ts" });
});

test("recovers the operation from leaked tool-call markup", () => {
  expect(prepareEditArguments({ op: 'op"create', path: "a.md", content: "x" }).op).toBe("create");
  expect(prepareEditArguments({ op: 'op" || op="create"', path: "a.md", content: "x" }).op).toBe("create");
});

test("infers the operation from the fields when op is missing or meaningless", () => {
  expect(prepareEditArguments({ path: "a.ts", oldText: "a", newText: "b" }).op).toBe("replace");
  expect(prepareEditArguments({ op: "op", path: "a.ts", edits: [{ oldText: "a", newText: "b" }] }).op).toBe("replace");
  expect(prepareEditArguments({ op: 'oldText" string="true">', path: "a.md", content: "x" }).op).toBe("create");
  expect(prepareEditArguments({ from: "a.ts", to: "b.ts" }).op).toBe("move");
});

test("rejects arguments whose operation cannot be determined", () => {
  expect(() => prepareEditArguments({ path: "a.ts" })).toThrow("edit requires 'op'");
  expect(() => prepareEditArguments({ path: 3 })).toThrow("edit expects");
});
