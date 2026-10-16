import { expect, test } from "bun:test";
import { rainbow } from "pi-powerline-footer/theme.ts";
import { useFastModeHome } from "./fast-mode-home.test-double.ts";
import { createFastModeRuntime } from "./fast-mode-runtime.test-double.ts";

useFastModeHome();

test("the fast badge uses the high-reasoning rainbow gradient", async () => {
  const harness = createFastModeRuntime();
  harness.emit("session_start");
  await harness.command("on");

  expect(harness.label).toBe("fast");
  expect(harness.status).toBe(rainbow("fast"));
  expect(harness.status).toStartWith("\u001b[38;2;178;129;214m");
  expect(harness.status).toEndWith("\u001b[0m");
});
