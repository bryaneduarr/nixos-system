import { afterAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createLiveSession } from "../registry/row/live-session.test-double.ts";
import { createHerdrSessions } from "./create-herdr-sessions.service.ts";
import { createRegistryIn } from "./create-herdr-sessions.test-double.ts";

const temporary = await mkdtemp(join(tmpdir(), "pi-herdr-sessions-test-"));
afterAll(() => rm(temporary, { recursive: true, force: true }));

describe("createHerdrSessions", () => {
  test("pending agent renames can be retried without suppressing other failures", async () => {
    const location = { pane: "w1:p1", tab: "w1:t1", workspace: "w1" };
    let pending = true;
    const herdr = createHerdrSessions(createRegistryIn(temporary), async (args) => {
      if (args[0] === "agent" && pending) {
        throw Object.assign(new Error("startup pending"), { code: "agent_launch_pending" });
      }
      return {};
    });
    expect(await herdr.name(location, "sample-pi-1")).toBe(false);
    pending = false;
    expect(await herdr.name(location, "sample-pi-1")).toBe(true);
    const broken = createHerdrSessions(createRegistryIn(temporary), async () => {
      throw new Error("disconnected");
    });
    await expect(broken.name(location, "sample-pi-1")).rejects.toThrow("disconnected");
  });

  test("lifecycle reports use the harness source and increasing sequences", async () => {
    const commands: string[][] = [];
    const herdr = createHerdrSessions(createRegistryIn(temporary), async (args) => {
      commands.push([...args]);
      return {};
    });
    const row = createLiveSession({ cwd: temporary, status: "working" });
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
    expect(commands.map((args) => args[1]).at(-1)).toBe("release-agent");

    const sequences = commands.map((args) => Number(args[args.indexOf("--seq") + 1]));
    for (const args of commands) {
      expect(args[args.indexOf("--source") + 1]).toBe("pi:harness");
      expect(args).not.toContain("herdr:pi");
      expect(args[2]).toBe(row.pane);
    }
    expect(sequences).toEqual([...new Set(sequences)].sort((left, right) => left - right));
  });

  test("switching only focuses a registered destination and never closes or signals a process", async () => {
    const store = createRegistryIn(temporary);
    const row = createLiveSession({ cwd: temporary, status: "working", historyEver: true });
    await store.publish(row);
    const commands: string[][] = [];
    const herdr = createHerdrSessions(store, async (args) => {
      commands.push([...args]);
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
    const store = createRegistryIn(temporary);
    const row = createLiveSession({ cwd: temporary });
    await store.publish(row);
    const commands: string[][] = [];
    const herdr = createHerdrSessions(store, async (args) => {
      commands.push([...args]);
      return {
        pane: { pane_id: row.pane, tab_id: row.tab, workspace_id: row.workspace, agent: "pi" },
        process_info: { foreground_processes: [{ pid: row.pid + 1 }] },
      };
    });
    await expect(herdr.focus(row)).rejects.toThrow("no longer hosts");
    expect(commands.some((args) => args[0] === "agent" && args[1] === "focus")).toBe(false);
  });
});
