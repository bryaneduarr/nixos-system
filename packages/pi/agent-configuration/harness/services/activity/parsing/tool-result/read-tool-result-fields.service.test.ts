import { expect, test } from "bun:test";
import type { TaskProgress } from "../../../../types/subagents/tasks/progress/task-progress.interface.ts";
import { readToolResultFields } from "./read-tool-result-fields.service.ts";

const progress: TaskProgress = {
  id: "run-1",
  title: "Map parser",
  role: "task",
  tools: ["read"],
  verificationCommands: [],
  currentTask: "Completed",
  status: "success",
  model: {
    state: "present",
    value: {
      provider: "example",
      id: "sample",
      name: { state: "present", value: "Sample" },
      reasoning: { state: "present", value: true },
      contextWindow: { state: "present", value: 1000 },
    },
  },
  thinkingLevel: { state: "present", value: "high" },
  activity: [
    {
      id: "call-1",
      toolName: "read",
      args: {},
      status: "success",
      text: "",
      startedAt: 1,
      endedAt: { state: "present", value: 2 },
    },
  ],
  usage: {
    usageState: "reported",
    usage: {
      inputTokens: 1,
      outputTokens: 2,
      cacheReadTokens: 3,
      cacheWriteTokens: 4,
      reasoningTokens: 5,
      totalTokens: 10,
      contextTokens: { state: "present", value: 7 },
      maxContextTokens: { state: "absent" },
    },
  },
};

test("task progress supplies the model, reasoning, usage, and tool calls of a subagent", () => {
  const fields = readToolResultFields(progress);

  expect(fields.model).toEqual(progress.model);
  expect(fields.thinkingLevel).toEqual(progress.thinkingLevel);
  expect(fields.usage).toEqual(progress.usage);
  expect(fields.sub).toEqual(progress.activity);
  expect(fields.details).toEqual({ state: "present", value: progress });
});

test("legacy flat progress still supplies its model and usage", () => {
  const fields = readToolResultFields({
    id: "run-1",
    title: "Map parser",
    role: "task",
    tools: [],
    verificationCommands: [],
    currentTask: "Completed",
    status: "success",
    model: { provider: "example", id: "sample" },
    thinkingLevel: "low",
    usage: { inputTokens: 2, outputTokens: 3 },
  });

  expect(fields.model.state).toBe("present");
  expect(fields.thinkingLevel).toEqual({ state: "present", value: "low" });
  expect(fields.usage).toMatchObject({ usageState: "reported", usage: { totalTokens: 5 } });
});

test("a result that is not task progress leaves the subagent fields unset", () => {
  expect(readToolResultFields({ output: "text" })).toEqual({
    details: { state: "absent" },
    sub: [],
    usage: { usageState: "unreported" },
    model: { state: "absent" },
    thinkingLevel: { state: "absent" },
  });
});
