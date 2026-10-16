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

test("persisted task progress without optional fields converts to explicit absent states", () => {
  expect(readTaskProgress(PERSISTED_PROGRESS)).toEqual({
    state: "present",
    value: {
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

test("task progress with an unknown role or status is rejected", () => {
  expect(readTaskProgress({ ...PERSISTED_PROGRESS, role: "unknown" })).toEqual({ state: "absent" });
  expect(readTaskProgress({ ...PERSISTED_PROGRESS, status: "paused" })).toEqual({ state: "absent" });
});
