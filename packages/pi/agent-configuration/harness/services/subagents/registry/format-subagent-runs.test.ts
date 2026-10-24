import { expect, test } from "bun:test";
import { NO_MATCHING_SUBAGENTS_MESSAGE } from "../../../constants/subagents/registry/subagent-command.constant.ts";
import { resolveTaskRole } from "../roles/resolve-task-role.service.ts";
import { absent } from "../roles/resolve-task-role.test-double.ts";
import { createTaskProgress } from "../tasks/progress/create-task-progress.service.ts";
import { formatSubagentRuns } from "./format-subagent-runs.service.ts";

test("no runs read as no matching subagents", () => {
  expect(formatSubagentRuns([])).toBe(NO_MATCHING_SUBAGENTS_MESSAGE);
});

test("each run is one line with its id, title, status, and current step", () => {
  const role = resolveTaskRole({ role: absent, tools: absent, verificationCommands: absent });
  const runs = [createTaskProgress("run-1", "Inspect parser", role), createTaskProgress("run-2", "Fix bug", role)];

  expect(formatSubagentRuns(runs)).toBe(
    "run-1 · Inspect parser · running · Starting\nrun-2 · Fix bug · running · Starting",
  );
});
