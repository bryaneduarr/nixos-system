import { afterAll, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { HerdrCommand } from "../../../../types/sessions/herdr/command/herdr-command.interface.ts";
import { createLiveSession } from "../../registry/row/live-session.test-double.ts";
import { createHerdrSessions } from "../create-herdr-sessions.service.ts";
import { createRegistryIn, managedSessionToken } from "../create-herdr-sessions.test-double.ts";

const temporary = await mkdtemp(join(tmpdir(), "pi-herdr-split-test-"));
afterAll(() => rm(temporary, { recursive: true, force: true }));

describe("split session pane", () => {
  test("creation splits the caller pane and waits for startup and registry readiness before focus", async () => {
    const store = createRegistryIn(temporary);
    const commands: string[][] = [];
    const cwd = "/tmp/project with spaces; echo unsafe";
    const source = { pane: "w2:p1", tab: "w2:t2", workspace: "w2" };
    let token = "";
    const command: HerdrCommand = async (args) => {
      commands.push([...args]);
      if (args[1] === "layout")
        return { layout: { panes: [{ pane_id: source.pane, rect: { width: 160, height: 40 } }] } };
      if (args[1] === "split") {
        token = managedSessionToken(args);
        return { pane: { pane_id: "w2:p3", tab_id: source.tab, workspace_id: source.workspace } };
      }
      if (args[1] === "start") {
        const name = await store.instanceName(cwd, token);
        expect(args[2]).toBe(name);
        expect(await store.list()).toEqual([]);
        await store.publish(createLiveSession({ identity: token, cwd, name, owned: true }));
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
    const store = createRegistryIn(temporary);
    await store.publish(createLiveSession({ cwd: temporary, owned: true }));
    const source = { pane: "w1:p1", tab: "w1:t1", workspace: "w1" };
    const commands: string[][] = [];
    const command: HerdrCommand = async (args) => {
      commands.push([...args]);
      if (args[1] === "layout")
        return { layout: { panes: [{ pane_id: source.pane, rect: { width: 60, height: 40 } }] } };
      if (args[1] === "split") {
        await store.publish(
          createLiveSession({
            identity: managedSessionToken(args),
            cwd: temporary,
            pane: "w1:p2",
            tab: source.tab,
            workspace: source.workspace,
            owned: true,
          }),
        );
      }
      return {
        pane: { pane_id: "w1:p2", tab_id: source.tab, workspace_id: source.workspace, agent: "pi" },
        process_info: { foreground_processes: [{ pid: process.pid }] },
      };
    };
    await createHerdrSessions(store, command).create(temporary, source);
    expect(commands.filter((args) => args[1] === "split").map((args) => args.slice(0, 6))).toEqual([
      ["pane", "split", "--pane", source.pane, "--direction", "down"],
    ]);
    expect(commands.some((args) => args[0] === "tab" || args[0] === "workspace")).toBe(false);
  });

  test("startup failure never focuses or closes existing panes", async () => {
    const store = createRegistryIn(temporary);
    const source = { pane: "w2:p1", tab: "w2:t2", workspace: "w2" };
    const commands: string[][] = [];
    const herdr = createHerdrSessions(store, async (args) => {
      commands.push([...args]);
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
      const herdr = createHerdrSessions(createRegistryIn(temporary), async (args) => {
        commands.push([...args]);
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
