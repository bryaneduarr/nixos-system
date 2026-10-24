import { expect, test } from "bun:test";
import { readTaskProgress } from "./read-task-progress.service.ts";

const PERSISTED_PROGRESS = {
  id: "run-1",
  title: "Map parser",
  role: "explore",
  tools: ["read"],
  verificationCommands: [],
  currentTask: "Reading parser.ts",
  status: "running",
  activity: [],
};

const CURRENT_MODEL = {
  state: "present",
  value: {
    provider: "example",
    id: "model-1",
    name: { state: "present", value: "Model One" },
    reasoning: { state: "absent" },
    contextWindow: { state: "absent" },
  },
} as const;

const CURRENT_PROGRESS = {
  ...PERSISTED_PROGRESS,
  model: CURRENT_MODEL,
  thinkingLevel: { state: "present", value: "low" },
  usage: { usageState: "unreported" },
};

test("persisted task progress without optional fields converts to explicit absent states", () => {
  expect(readTaskProgress(PERSISTED_PROGRESS)).toEqual({
    found: true,
    progress: {
      id: "run-1",
      title: "Map parser",
      role: "explore",
      tools: ["read"],
      verificationCommands: [],
      currentTask: "Reading parser.ts",
      status: "running",
      model: { state: "absent" },
      thinkingLevel: { state: "absent" },
      activity: [],
      usage: { usageState: "unreported" },
    },
  });
});

test("current task progress keeps its model and thinking level", () => {
  expect(readTaskProgress(CURRENT_PROGRESS)).toEqual({
    found: true,
    progress: {
      id: "run-1",
      title: "Map parser",
      role: "explore",
      tools: ["read"],
      verificationCommands: [],
      currentTask: "Reading parser.ts",
      status: "running",
      model: CURRENT_MODEL,
      thinkingLevel: { state: "present", value: "low" },
      activity: [],
      usage: { usageState: "unreported" },
    },
  });
});

test("task progress with an unknown role or status is rejected", () => {
  expect(readTaskProgress({ ...PERSISTED_PROGRESS, role: "unknown" })).toEqual({ found: false });
  expect(readTaskProgress({ ...PERSISTED_PROGRESS, status: "paused" })).toEqual({ found: false });
});
