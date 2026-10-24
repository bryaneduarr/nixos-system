import { expect, test } from "bun:test";
import { locationKey } from "./location-key.service.ts";

test("joins the file and the line", () => {
  expect(locationKey({ file: "src/sample.ts", line: 8, text: "sample" })).toBe("src/sample.ts:8");
});
