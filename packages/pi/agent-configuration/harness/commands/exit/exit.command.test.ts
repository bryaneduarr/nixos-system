import { describe, expect, test } from "bun:test";
import { handlerNamed } from "../../services/sessions/install/handler-named.test-double.ts";
import { exitHarness, installExit } from "./exit.command.test-double.ts";

describe("explicit exit command", () => {
  test("explicit exit confirms busy work, pending messages and drafts, cancellation has no effects", async () => {
    const previous = process.env.HERDR_ENV;
    delete process.env.HERDR_ENV;
    const h = exitHarness();
    try {
      installExit(h.api, { command: () => async () => ({}), schedule: async () => () => {} });
      h.reset();
      h.activity("draft", true, true);
      await handlerNamed(h.commands, "exit")("", h.ctx);
      expect(h.effects).toHaveLength(1);
      expect(h.effects[0]).toContain("active work, pending messages, the editor draft");
      h.approve();
      await handlerNamed(h.shortcuts, "ctrl+alt+q")(h.ctx);
      expect(h.effects.slice(-2)).toEqual(["shutdown", "abort"]);
      const count = h.effects.length;
      await handlerNamed(h.commands, "exit")("", h.ctx);
      installExit(h.api, { command: () => async () => ({}), schedule: async () => () => {} });
      await handlerNamed(h.shortcuts, "ctrl+alt+q")(h.ctx);
      expect(h.effects).toHaveLength(count);
    } finally {
      h.reset();
      if (previous === undefined) delete process.env.HERDR_ENV;
      else process.env.HERDR_ENV = previous;
    }
  });

  test("reload while confirming prevents stale context shutdown", async () => {
    const h = exitHarness();
    installExit(h.api, { command: () => async () => ({}), schedule: async () => () => {} });
    h.reset();
    h.activity("draft", false, false);
    let resolve: (value: boolean) => void = () => {};
    h.setConfirm(
      () =>
        new Promise<boolean>((done) => {
          resolve = done;
        }),
    );
    const attempt = handlerNamed(h.commands, "exit")("", h.ctx);
    await handlerNamed(h.shortcuts, "ctrl+alt+q")(h.ctx);
    h.reset();
    resolve(true);
    await attempt;
    expect(h.effects).toEqual([]);
  });
});
