import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";
import type { LiveSession } from "../../../types/sessions/registry/row/live-session.interface.ts";
import type { SessionRegistry } from "../../../types/sessions/registry/row/session-registry.interface.ts";
import { createHerdrSessions } from "../herdr/create-herdr-sessions.service.ts";
import { createDefaultSessionDependencies } from "./create-default-session-dependencies.service.ts";
import { handlerNamed } from "./handler-named.test-double.ts";
import { installSessions } from "./install-sessions.service.ts";
import {
  applyEnvironment,
  createRenumberingContext,
  ENVIRONMENT_KEYS,
  environmentFor,
  registerFakeApi,
  restoreEnvironment,
} from "./install-sessions.test-double.ts";
import { createRenumberCommand } from "./install-sessions-renumbering.test-double.ts";

function presentRegistry(store: ValueState<SessionRegistry>): SessionRegistry {
  if (store.state === "absent") throw new Error("Registry was not created");
  return store.value;
}

describe("installSessions renumbering", () => {
  test("publication renumbers the pane, agent, and live record after other sessions close", async () => {
    const root = await mkdtemp(join(tmpdir(), "pi-renumber-test-"));
    const previous = { ...process.env };
    const { api, events } = registerFakeApi();
    const names: string[] = [];
    const otherSessions: LiveSession[] = [];
    let store: ValueState<SessionRegistry> = { state: "absent" };
    const token = randomUUID();
    applyEnvironment(environmentFor(root, token));
    const ctx = createRenumberingContext(root);
    try {
      installSessions(api, {
        ...createDefaultSessionDependencies(),
        herdr: (registry) => {
          store = { state: "present", value: registry };
          const command = createRenumberCommand(registry, root, otherSessions);
          return createHerdrSessions(registry, async (args) => {
            if (args[1] === "rename") names.push(`${args[0]}:${args[3]}`);
            return command(args);
          });
        },
      });
      await handlerNamed(events, "session_start")({}, ctx);
      expect(names.map((name) => name.slice(-4))).toEqual(["pi-4", "pi-4"]);
      await handlerNamed(events, "session_shutdown")({ reason: "reload" }, ctx);
      await handlerNamed(events, "session_start")({}, ctx);
      expect(names.at(-1)).toMatch(/pi-4$/);
      const registry = presentRegistry(store);
      for (const row of otherSessions) await registry.remove(row.identity, false);
      await handlerNamed(events, "agent_settled")({}, ctx);
      expect(names.slice(-2).map((name) => name.slice(-4))).toEqual(["pi-1", "pi-1"]);
      expect((await registry.list()).find((row) => row.identity === token)).toMatchObject({
        name: expect.stringMatching(/pi-1$/),
      });
    } finally {
      await handlerNamed(events, "session_shutdown")({ reason: "quit" }, ctx);
      restoreEnvironment(ENVIRONMENT_KEYS, previous);
      await rm(root, { recursive: true, force: true });
    }
  });
});
