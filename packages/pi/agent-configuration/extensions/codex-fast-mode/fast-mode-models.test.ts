import { expect, test } from "bun:test";
import { useFastModeHome } from "./fast-mode-home.test-double.ts";
import { createFastModeRuntime } from "./fast-mode-runtime.test-double.ts";
import { lastRequest } from "./fast-mode-stream.test-double.ts";

useFastModeHome();

test("unsupported models never request priority, even with a saved on preference", async () => {
  const harness = createFastModeRuntime();
  harness.emit("session_start");
  await harness.command("on");
  harness.ctx.model.id = "unsupported";
  harness.emit("model_select");
  expect(harness.status).toBeUndefined();
  harness.request();
  expect(lastRequest().fast).toBe(false);
  harness.ctx.model.id = "test-fast-model";
  harness.emit("model_select");
  expect(harness.label).toBe("fast");
  harness.ctx.model.id = "unsupported";
  harness.emit("model_select");
  await harness.toggle();
  await harness.command("on");
  expect(harness.entries.at(-1)).toMatchObject({ data: { enabled: false } });
  harness.ctx.model.id = "test-fast-model";
  harness.emit("model_select");
  expect(harness.status).toBeUndefined();
  await harness.command("invalid");
  expect(harness.status).toBeUndefined();
  harness.entries.length = 0;
  harness.emit("session_tree");
  expect(harness.status).toBeUndefined();
});
