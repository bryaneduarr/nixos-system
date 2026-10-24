import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { handlerNamed } from "./handler-named.test-double.ts";
import { installSessions } from "./install-sessions.service.ts";
import {
  applyEnvironment,
  createInstallContext,
  ENVIRONMENT_KEYS,
  environmentFor,
  type InstallFlags,
  type InstallState,
  registerFakeApi,
  restoreEnvironment,
} from "./install-sessions.test-double.ts";
import {
  commandNamed,
  createInstallDependencies,
  lastCommandArgument,
  lastReport,
  lastReportState,
  stateFlagOf,
} from "./install-sessions-herdr.test-double.ts";

describe("installSessions agent state", () => {
  test("agent state and completion notifications follow the active run", async () => {
    const root = await mkdtemp(join(tmpdir(), "pi-install-state-test-"));
    const previous = { ...process.env };
    const { api, events } = registerFakeApi();
    const sentCommands: string[][] = [];
    const notifications: string[] = [];
    const token = randomUUID();
    const flags: InstallFlags = { notificationFails: false, pendingRenames: 1, createFails: false };
    const state: InstallState = {
      idle: true,
      editor: "",
      shutdowns: 0,
      cleanups: 0,
      entries: [{ type: "message", message: { role: "custom", content: "startup" } }],
      terminalInput: () => {},
      selection: "cancel",
      menuSelections: 0,
      projectSelections: 0,
    };
    applyEnvironment(environmentFor(root, token));
    const ctx = createInstallContext(root, state, notifications);
    try {
      installSessions(api, createInstallDependencies({ root, token, sentCommands, flags, state, created: [] }));
      await handlerNamed(events, "session_start")({}, ctx);
      expect(sentCommands.some((args) => args[1] === "report-agent" && args.includes("idle"))).toBe(true);
      expect(commandNamed(sentCommands, "notification", "show")).toHaveLength(0);

      state.idle = false;
      await handlerNamed(events, "agent_start")({}, ctx);
      expect(lastReportState(sentCommands)).toBe("working");
      expect(stateFlagOf(lastReport(sentCommands), "--source")).toBe("pi:harness");
      state.idle = true;
      await handlerNamed(events, "agent_settled")({}, ctx);
      expect(lastReportState(sentCommands)).toBe("idle");
      const completionName = lastCommandArgument(sentCommands, { command: "pane", subcommand: "rename", position: 3 });
      expect(commandNamed(sentCommands, "notification", "show")).toEqual([
        ["notification", "show", "Pi finished", "--body", completionName, "--sound", "done"],
      ]);
      await handlerNamed(events, "agent_settled")({}, ctx);
      expect(sentCommands.filter((args) => args[0] === "notification")).toHaveLength(1);

      for (const mode of ["rpc", "print", "json"] as const) {
        await handlerNamed(events, "agent_start")({}, { ...ctx, mode });
        await handlerNamed(events, "agent_settled")({}, { ...ctx, mode });
      }
      expect(sentCommands.filter((args) => args[0] === "notification")).toHaveLength(1);

      await handlerNamed(events, "agent_start")({}, ctx);
      await handlerNamed(events, "agent_settled")({ aborted: true }, ctx);
      expect(sentCommands.filter((args) => args[0] === "notification")).toHaveLength(1);

      await handlerNamed(events, "agent_start")({}, ctx);
      await handlerNamed(events, "agent_settled")({}, ctx);
      expect(sentCommands.filter((args) => args[0] === "notification")).toHaveLength(2);

      flags.notificationFails = true;
      await handlerNamed(events, "agent_start")({}, ctx);
      await handlerNamed(events, "agent_settled")({}, ctx);
      expect(notifications.at(-1)).toContain("Completion notification failed");
      await handlerNamed(events, "agent_settled")({}, ctx);
      expect(sentCommands.filter((args) => args[0] === "notification")).toHaveLength(3);
      flags.notificationFails = false;
    } finally {
      await handlerNamed(events, "session_shutdown")({}, ctx);
      restoreEnvironment(ENVIRONMENT_KEYS, previous);
      await rm(root, { recursive: true, force: true });
    }
  });
});
