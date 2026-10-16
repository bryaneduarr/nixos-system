import { afterAll, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { HerdrCommand } from "../../../types/sessions/herdr/herdr-command.interface.ts";
import type { LiveSession } from "../../../types/sessions/registry/live-session.interface.ts";
import type { SessionRegistry } from "../../../types/sessions/registry/session-registry.interface.ts";
import { createSessionRegistry } from "../registry/create-session-registry.service.ts";
import { processStartIdentity } from "../registry/process-start-identity.service.ts";
import { createHerdrSessions } from "./create-herdr-sessions.service.ts";

const temporary = await mkdtemp(join(tmpdir(), "pi-herdr-sessions-test-"));
afterAll(() => rm(temporary, { recursive: true, force: true }));
const processStart = await processStartIdentity(process.pid);

function session(overrides: Partial<LiveSession> = {}): LiveSession {
  return {
    identity: randomUUID(),
    pid: process.pid,
    processStart,
    updatedAt: Date.now(),
    cwd: temporary,
    pane: "w2:p3",
    tab: "w2:t2",
    workspace: "w2",
    sessionId: "session-a",
    name: "test",
    branch: "main",
    context: { usageState: "unavailable" },
    status: "idle",
    owned: false,
    historyEver: false,
    cleanupSafe: false,
    ...overrides,
  };
}

function registry(): SessionRegistry {
  return createSessionRegistry(join(temporary, randomUUID()));
}

describe("createHerdrSessions", () => {
  test("pending agent renames can be retried without suppressing other failures", async () => {
    const location = { pane: "w1:p1", tab: "w1:t1", workspace: "w1" };
    let pending = true;
    const herdr = createHerdrSessions(registry(), async (args) => {
      if (args[0] === "agent" && pending) {
        throw Object.assign(new Error("startup pending"), { code: "agent_launch_pending" });
      }
      return {};
    });
    expect(await herdr.name(location, "sample-pi-1")).toBe(false);
    pending = false;
    expect(await herdr.name(location, "sample-pi-1")).toBe(true);
    const broken = createHerdrSessions(registry(), async () => {
      throw new Error("disconnected");
    });
    await expect(broken.name(location, "sample-pi-1")).rejects.toThrow("disconnected");
  });

  test("lifecycle reports use the harness source and increasing sequences", async () => {
    const commands: string[][] = [];
    const herdr = createHerdrSessions(registry(), async (args) => {
      commands.push(args);
      return {};
    });
    const row = session({ status: "working" });
    const path = join(temporary, "session.jsonl");

    await herdr.report(row, { kind: "file", path });
    await herdr.report({ ...row, status: "idle" }, { kind: "file", path });
    await herdr.report({ ...row, status: "draft" }, { kind: "identifier" });
    await herdr.release(row);

    const stateReports = commands.filter((args) => args[1] === "report-agent");
    expect(stateReports.map((args) => args[args.indexOf("--state") + 1])).toEqual(["working", "idle", "idle"]);
    expect(commands[0]).toContain("--agent-session-path");
    expect(commands[0]).toContain(path);
    expect(commands[4]).toContain("--agent-session-id");
    expect(commands[4]).toContain(row.sessionId);
    expect(commands.at(-1)?.[1]).toBe("release-agent");

    const sequences = commands.map((args) => Number(args[args.indexOf("--seq") + 1]));
    for (const [index, args] of commands.entries()) {
      expect(args[args.indexOf("--source") + 1]).toBe("pi:harness");
      expect(args).not.toContain("herdr:pi");
      expect(args[2]).toBe(row.pane);
      if (index > 0) expect(sequences[index] ?? 0).toBeGreaterThan(sequences[index - 1] ?? 0);
    }
  });

  test("switching only focuses a registered destination and never closes or signals a process", async () => {
    const store = registry();
    const row = session({ status: "working", historyEver: true });
    await store.publish(row);
    const commands: string[][] = [];
    const herdr = createHerdrSessions(store, async (args) => {
      commands.push(args);
      return {
        pane: { pane_id: row.pane, tab_id: row.tab, workspace_id: row.workspace, agent: "pi" },
        process_info: { foreground_processes: [{ pid: row.pid }] },
      };
    });
    await herdr.focus(row);
    expect(commands).toEqual([
      ["pane", "get", row.pane],
      ["pane", "process-info", "--pane", row.pane],
      ["agent", "focus", row.pane],
    ]);
    await store.publish({ ...row, sessionId: "replacement" });
    await expect(herdr.focus(row)).rejects.toThrow("no longer live");
    expect(commands.length).toBe(3);
  });

  test("focus refuses a replacement process in an otherwise valid Pi pane", async () => {
    const store = registry();
    const row = session();
    await store.publish(row);
    const commands: string[][] = [];
    const herdr = createHerdrSessions(store, async (args) => {
      commands.push(args);
      return {
        pane: { pane_id: row.pane, tab_id: row.tab, workspace_id: row.workspace, agent: "pi" },
        process_info: { foreground_processes: [{ pid: row.pid + 1 }] },
      };
    });
    await expect(herdr.focus(row)).rejects.toThrow("no longer hosts");
    expect(commands.some((args) => args[0] === "agent" && args[1] === "focus")).toBe(false);
  });

  test("creation splits the caller pane and waits for startup and registry readiness before focus", async () => {
    const store = registry();
    const commands: string[][] = [];
    const cwd = "/tmp/project with spaces; echo unsafe";
    const source = { pane: "w2:p1", tab: "w2:t2", workspace: "w2" };
    let token = "";
    const command: HerdrCommand = async (args) => {
      commands.push(args);
      if (args[1] === "layout")
        return { layout: { panes: [{ pane_id: source.pane, rect: { width: 160, height: 40 } }] } };
      if (args[1] === "split") {
        const env = args.find((item) => item.startsWith("PI_MANAGED_SESSION=")) ?? "";
        token = env.slice("PI_MANAGED_SESSION=".length);
        return { pane: { pane_id: "w2:p3", tab_id: source.tab, workspace_id: source.workspace } };
      }
      if (args[1] === "start") {
        const name = await store.instanceName(cwd, token);
        expect(args[2]).toBe(name);
        expect(await store.list()).toEqual([]);
        await store.publish(session({ identity: token, cwd, name, owned: true }));
      }
      return {
        pane: { pane_id: "w2:p3", tab_id: source.tab, workspace_id: source.workspace, agent: "pi" },
        process_info: { foreground_processes: [{ pid: process.pid }] },
      };
    };
    await createHerdrSessions(store, command).create(cwd, source);
    expect(commands.map((args) => args.slice(0, 2))).toEqual([
      ["pane", "layout"],
      ["pane", "split"],
      ["pane", "rename"],
      ["agent", "start"],
      ["pane", "get"],
      ["pane", "process-info"],
      ["agent", "focus"],
    ]);
    expect(commands[1]).toContain(cwd);
    expect(commands[1]).toContain("--no-focus");
    expect(commands[1]).toContain(source.pane);
    expect(commands[1]).toContain("right");
    expect(commands[3]).toContain("--timeout");
  });

  test("narrow panes split down even when another workspace hosts the project", async () => {
    const store = registry();
    await store.publish(session({ owned: true }));
    const source = { pane: "w1:p1", tab: "w1:t1", workspace: "w1" };
    const commands: string[][] = [];
    const command: HerdrCommand = async (args) => {
      commands.push(args);
      if (args[1] === "layout")
        return { layout: { panes: [{ pane_id: source.pane, rect: { width: 60, height: 40 } }] } };
      if (args[1] === "split") {
        const token = (args.find((item) => item.startsWith("PI_MANAGED_SESSION=")) ?? "").split("=")[1] ?? "";
        await store.publish(
          session({ identity: token, pane: "w1:p2", tab: source.tab, workspace: source.workspace, owned: true }),
        );
      }
      return {
        pane: { pane_id: "w1:p2", tab_id: source.tab, workspace_id: source.workspace, agent: "pi" },
        process_info: { foreground_processes: [{ pid: process.pid }] },
      };
    };
    await createHerdrSessions(store, command).create(temporary, source);
    expect(commands[1]?.slice(0, 6)).toEqual(["pane", "split", "--pane", source.pane, "--direction", "down"]);
    expect(commands.some((args) => args[0] === "tab" || args[0] === "workspace")).toBe(false);
  });

  test("startup failure never focuses or closes existing panes", async () => {
    const store = registry();
    const source = { pane: "w2:p1", tab: "w2:t2", workspace: "w2" };
    const commands: string[][] = [];
    const herdr = createHerdrSessions(store, async (args) => {
      commands.push(args);
      if (args[1] === "layout")
        return { layout: { panes: [{ pane_id: source.pane, rect: { width: 160, height: 40 } }] } };
      if (args[1] === "start") throw new Error("Not ready");
      return { pane: { pane_id: "w2:p3", tab_id: source.tab, workspace_id: source.workspace } };
    });
    await expect(herdr.create(temporary, source)).rejects.toThrow("Not ready");
    expect(commands.map((args) => args.slice(0, 2))).toEqual([
      ["pane", "layout"],
      ["pane", "split"],
      ["pane", "rename"],
      ["agent", "start"],
    ]);
    expect(await store.instanceName(temporary, randomUUID())).toMatch(/-pi-1$/);
  });

  test("creation rejects a destination outside the calling tab before starting Pi", async () => {
    const source = { pane: "w2:p1", tab: "w2:t2", workspace: "w2" };
    const destinations = [
      { pane_id: "w2:p3", tab_id: "w2:t3", workspace_id: "w2" },
      { pane_id: "w3:p1", tab_id: "w3:t1", workspace_id: "w3" },
      { pane_id: source.pane, tab_id: source.tab, workspace_id: source.workspace },
    ];
    for (const destination of destinations) {
      const commands: string[][] = [];
      const herdr = createHerdrSessions(registry(), async (args) => {
        commands.push(args);
        if (args[1] === "layout")
          return { layout: { panes: [{ pane_id: source.pane, rect: { width: 160, height: 40 } }] } };
        return { pane: destination };
      });
      await expect(herdr.create(temporary, source)).rejects.toThrow("sibling pane");
      expect(commands.map((args) => args.slice(0, 2))).toEqual([
        ["pane", "layout"],
        ["pane", "split"],
      ]);
    }
  });
});
