import { describe, expect, test } from "bun:test";
import { handlerNamed } from "../../services/sessions/install/handler-named.test-double.ts";
import { exitHarness, installExit } from "./exit.command.test-double.ts";

describe("explicit exit with Herdr", () => {
  test("Herdr preflight failure leaves Pi running and reports an actionable error", async () => {
    const previous = process.env.HERDR_ENV;
    process.env.HERDR_ENV = "1";
    const h = exitHarness();
    let workers = 0;
    try {
      installExit(h.api, {
        command: () => async () => {
          throw new Error("unsafe process identity");
        },
        schedule: async () => {
          workers++;
          return () => {};
        },
      });
      h.reset();
      await handlerNamed(h.commands, "exit")("", h.ctx);
      expect(h.effects).toEqual([]);
      expect(workers).toBe(0);
      expect(h.notifications.at(-1)).toContain("retry /exit");
    } finally {
      h.reset();
      if (previous === undefined) delete process.env.HERDR_ENV;
      else process.env.HERDR_ENV = previous;
    }
  });
});
