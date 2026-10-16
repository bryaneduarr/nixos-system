import { expect, test } from "bun:test";
import { runApprovedCommand } from "./run-approved-command.service.ts";

test("implementation and verification commands use an exact allowlist", async () => {
  const command = "printf approved";
  const cwd = process.cwd();

  const absentSignal = { state: "absent" } as const;
  const allowed = await runApprovedCommand({ approvedCommands: [command], command, cwd, signal: absentSignal });
  const deniedCommand = `${command}; printf changed`;
  const denied = await runApprovedCommand({
    approvedCommands: [command],
    command: deniedCommand,
    cwd,
    signal: absentSignal,
  });

  expect(allowed.text).toContain("approved");
  expect(allowed.isError).toBe(false);
  expect(denied.text).toBe("Blocked: command is not on the approved list.");
  expect(denied.isError).toBe(true);
});
