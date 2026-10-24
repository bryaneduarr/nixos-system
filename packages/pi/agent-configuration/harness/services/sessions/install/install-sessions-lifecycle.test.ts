import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { getKeybindings, KeybindingsManager, setKeybindings } from "@earendil-works/pi-tui";
import { handlerNamed } from "./handler-named.test-double.ts";
import { installSessions } from "./install-sessions.service.ts";
import {
  applyEnvironment,
  createInstallContext,
  createInstallState,
  createPasteImageDefinitions,
  ENVIRONMENT_KEYS,
  environmentFor,
  type InstallFlags,
  registerFakeApi,
  restoreEnvironment,
} from "./install-sessions.test-double.ts";
import {
  commandNamed,
  createInstallDependencies,
  expectHistoryRecord,
  lastCommandArgument,
  renameTargets,
} from "./install-sessions-herdr.test-double.ts";

describe("installSessions", () => {
  test("install reports lifecycle and session identity, protects user history across new sessions", async () => {
    const root = await mkdtemp(join(tmpdir(), "pi-install-test-"));
    const previous = { ...process.env };
    const previousKeybindings = getKeybindings();
    setKeybindings(new KeybindingsManager(createPasteImageDefinitions(), { "app.clipboard.pasteImage": "ctrl+y" }));
    const { api, events, shortcuts, commands: registeredCommands } = registerFakeApi();
    const sentCommands: string[][] = [];
    const created: { cwd: string; pane: string }[] = [];
    const notifications: string[] = [];
    const token = randomUUID();
    const flags: InstallFlags = { notificationFails: false, pendingRenames: 1, createFails: false };
    const state = createInstallState();
    applyEnvironment(environmentFor(root, token));
    const ctx = createInstallContext(root, state, notifications);
    const show = (target: ExtensionContext) => handlerNamed(shortcuts, "ctrl+alt+s")(target);
    const createHere = (target: ExtensionContext) => handlerNamed(shortcuts, "ctrl+alt+n")(target);
    const dependencies = createInstallDependencies({ root, token, sentCommands, flags, state, created });
    try {
      installSessions(api, dependencies);
      expect([...shortcuts.keys()]).toEqual(["ctrl+alt+q", "ctrl+alt+s", "ctrl+alt+n"]);
      await createHere({ ...ctx, mode: "rpc" });
      expect(created).toEqual([]);
      expect(notifications.at(-1)).toContain("interactive Pi");
      await handlerNamed(events, "session_start")({}, ctx);
      expect(
        sentCommands.some((args) => args[1] === "report-agent-session" && args.includes(join(root, "session.jsonl"))),
      ).toBe(true);
      expect(renameTargets(sentCommands, "pane").some((name) => /-pi-1$/.test(name))).toBe(true);
      expect(renameTargets(sentCommands, "agent").some((name) => /-pi-1$/.test(name))).toBe(true);
      expect(notifications.some((message) => message.includes("Session manager unavailable"))).toBe(false);

      state.selection = "self";
      await handlerNamed(registeredCommands, "sessions")("", ctx);
      expect(commandNamed(sentCommands, "agent", "rename")).toHaveLength(2);
      expect(commandNamed(sentCommands, "agent", "focus")).toHaveLength(1);

      state.selection = "new";
      flags.createFails = true;
      await show(ctx);
      expect(state.cleanups).toBe(0);
      flags.createFails = false;
      await show(ctx);
      expect(state.cleanups).toBe(1);
      expect(state.shutdowns).toBe(1);

      state.editor = "existing draft";
      const menusBefore = state.menuSelections;
      const projectsBefore = state.projectSelections;
      await createHere(ctx);
      expect(created.at(-1)).toEqual({ cwd: root, pane: "w1:p1" });
      expect(state.menuSelections).toBe(menusBefore);
      expect(state.projectSelections).toBe(projectsBefore);
      expect(state.editor).toBe("existing draft");
      expect(state.cleanups).toBe(1);
      flags.createFails = true;
      await createHere(ctx);
      expect(notifications.at(-1)).toContain("startup failed");
      expect(state.cleanups).toBe(1);
      flags.createFails = false;
      state.terminalInput("\x19");
      await show(ctx);
      expect(state.cleanups).toBe(1);
      state.editor = "";
      await show(ctx);
      expect(state.cleanups).toBe(1);
      expect(state.shutdowns).toBe(1);

      await handlerNamed(events, "before_agent_start")({}, ctx);
      await handlerNamed(events, "session_shutdown")({ reason: "new" }, ctx);
      state.entries = [];
      await handlerNamed(events, "session_start")({}, ctx);
      state.selection = "new";
      await show(ctx);
      expect(state.shutdowns).toBe(1);
      expect(state.cleanups).toBe(1);
      await expectHistoryRecord(root, token);

      await handlerNamed(events, "session_shutdown")({}, ctx);
      process.env.PI_MANAGED_SESSION = randomUUID();
      state.entries = [];
      let canceled = 0;
      installSessions(api, {
        ...dependencies,
        scheduleCleanup: async () => {
          await handlerNamed(events, "before_agent_start")({}, ctx);
          return () => {
            canceled++;
          };
        },
      });
      await handlerNamed(events, "session_start")({}, ctx);
      state.selection = "new";
      await show(ctx);
      expect(canceled).toBe(1);
      expect(state.shutdowns).toBe(1);

      await handlerNamed(events, "session_shutdown")({}, ctx);
      delete process.env.PI_MANAGED_SESSION;
      installSessions(api, dependencies);
      await handlerNamed(events, "session_start")({}, ctx);
      const firstName = lastCommandArgument(sentCommands, { command: "agent", subcommand: "rename", position: 3 });
      await handlerNamed(events, "session_shutdown")({}, ctx);
      installSessions(api, dependencies);
      await handlerNamed(events, "session_start")({}, ctx);
      const reloadedName = lastCommandArgument(sentCommands, { command: "agent", subcommand: "rename", position: 3 });
      expect(reloadedName).toBe(firstName);
      await createHere(ctx);
      expect(state.cleanups).toBe(1);
      expect(state.shutdowns).toBe(1);
    } finally {
      await handlerNamed(events, "session_shutdown")({}, ctx);
      setKeybindings(previousKeybindings);
      restoreEnvironment(ENVIRONMENT_KEYS, previous);
      await rm(root, { recursive: true, force: true });
    }
  });
});
