import { expect, test } from "bun:test";
import { readApiError } from "./read-api-error.service.ts";

test("only assistant messages that stopped with an error message report an API error", () => {
  const failed = { role: "assistant", content: [], stopReason: "error", errorMessage: "API Error: overloaded" };

  expect(readApiError(failed)).toEqual({ state: "present", value: "API Error: overloaded" });
  expect(readApiError({ ...failed, stopReason: "stop" })).toEqual({ state: "absent" });
  expect(readApiError({ ...failed, errorMessage: " " })).toEqual({ state: "absent" });
  expect(readApiError({ ...failed, role: "user" })).toEqual({ state: "absent" });
  expect(readApiError("not a message")).toEqual({ state: "absent" });
});
