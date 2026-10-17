import { expect, test } from "bun:test";
import { readSubagentMetadata } from "./read-subagent-metadata.service.ts";

test("subagent metadata keeps the model and marks an invalid context window as absent", () => {
  expect(readSubagentMetadata({ model: { provider: "example", id: "sample", contextWindow: -1 } })).toEqual({
    model: {
      state: "present",
      value: {
        provider: "example",
        id: "sample",
        name: { state: "absent" },
        reasoning: { state: "absent" },
        contextWindow: { state: "absent" },
      },
    },
    thinkingLevel: { state: "absent" },
  });
});
