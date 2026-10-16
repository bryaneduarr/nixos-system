import { expect, test } from "bun:test";
import { useFastModeHome } from "./fast-mode-home.test-double.ts";
import { createFastModeRuntime } from "./fast-mode-runtime.test-double.ts";
import { lastRequest } from "./fast-mode-stream.test-double.ts";

useFastModeHome();

test("the visible menu toggles priority options without usage notifications", async () => {
  const harness = createFastModeRuntime();
  harness.emit("session_start");
  expect(harness.status).toBeUndefined();
  harness.request();
  expect(lastRequest().fast).toBe(false);
  await harness.command("");
  expect(harness.label).toBe("fast");
  harness.request({ apiKey: "test-key", reasoning: "off", sessionId: "test-session", transport: "sse" });
  expect(lastRequest()).toMatchObject({
    fast: true,
    options: {
      serviceTier: "priority",
      sessionId: "test-session",
      transport: "sse",
      maxTokens: 8192,
    },
  });
  expect(lastRequest().options.reasoningEffort).toBeUndefined();
  harness.emit("session_start");
  expect(harness.label).toBe("fast");
  await harness.command("off");
  harness.request();
  expect(lastRequest().fast).toBe(false);
  harness.select(undefined);
  await harness.command("");
  expect(harness.status).toBeUndefined();
  expect(harness.menuTitle).toBe("Codex fast mode");
  expect(harness.notifications).toEqual([]);
});
