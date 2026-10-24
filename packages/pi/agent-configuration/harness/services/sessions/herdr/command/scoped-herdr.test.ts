import { afterAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scopedHerdr } from "./scoped-herdr.service.ts";

const temporary = await mkdtemp(join(tmpdir(), "pi-herdr-test-"));
afterAll(() => rm(temporary, { recursive: true, force: true }));

describe("scopedHerdr", () => {
  test("nonzero CLI exits preserve structured Herdr error codes", async () => {
    const previous = process.env.HERDR_BIN_PATH;
    const binary = join(temporary, "fake-herdr");
    await writeFile(
      binary,
      `#!${process.execPath}\nprocess.stderr.write(JSON.stringify({ error: { code: "agent_launch_pending", message: "startup pending" } })); process.exit(1);\n`,
      { mode: 0o700 },
    );
    try {
      process.env.HERDR_BIN_PATH = binary;
      await expect(scopedHerdr("/tmp/sample.sock")(["agent", "rename", "w1:p1", "sample-pi-1"])).rejects.toMatchObject({
        code: "agent_launch_pending",
      });
    } finally {
      if (previous === undefined) delete process.env.HERDR_BIN_PATH;
      else process.env.HERDR_BIN_PATH = previous;
    }
  });
});
