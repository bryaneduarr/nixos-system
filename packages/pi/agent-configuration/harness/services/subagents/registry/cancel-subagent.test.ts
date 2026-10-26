import { expect, test } from "bun:test";
import { SUBAGENT_NOT_RUNNING_MESSAGE } from "../../../constants/subagents/registry/subagent-command.constant.ts";
import { cancelSubagent } from "./cancel-subagent.service.ts";
import { createSubagentRegistry } from "./create-subagent-registry.service.ts";

test("cancelling an unknown subagent says none is running", () => {
  expect(cancelSubagent(createSubagentRegistry(), "missing")).toBe(SUBAGENT_NOT_RUNNING_MESSAGE);
});
