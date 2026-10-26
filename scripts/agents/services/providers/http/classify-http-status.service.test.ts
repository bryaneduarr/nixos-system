import { describe, expect, test } from "bun:test";
import { classifyHttpStatus } from "./classify-http-status.service.ts";

describe("classifyHttpStatus", () => {
  test.each([401, 403])("classifies HTTP %i as a rejected token", (status) => {
    expect(classifyHttpStatus(status)).toEqual({ state: "rejected-token" });
  });

  test.each([200, 204, 299])("classifies HTTP %i as a success", (status) => {
    expect(classifyHttpStatus(status)).toEqual({ state: "success" });
  });

  test.each([199, 300, 404, 500])("classifies HTTP %i as an HTTP error with its status", (status) => {
    expect(classifyHttpStatus(status)).toEqual({ state: "http-error", status });
  });
});
