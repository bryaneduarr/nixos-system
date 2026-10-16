import { expect, test } from "bun:test";
import { mkdirSync, writeFileSync } from "node:fs";
import {
  readSavedPreference,
  stateDirectoryPath,
  stateFilePath,
  useFastModeHome,
} from "./fast-mode-home.test-double.ts";
import { createFastModeRuntime } from "./fast-mode-runtime.test-double.ts";
import { lastRequest } from "./fast-mode-stream.test-double.ts";

useFastModeHome();

test("the shortcut persists both choices across fresh extension instances", async () => {
  const harness = createFastModeRuntime();
  harness.emit("session_start");
  expect(harness.shortcutKey).toBe("ctrl+alt+f");
  await harness.toggle();
  expect(harness.label).toBe("fast");
  expect(harness.status).toContain("\u001b[38;2;");
  expect(readSavedPreference()).toEqual({ enabled: true });

  const nextSession = createFastModeRuntime();
  nextSession.entries.push({ type: "custom", customType: "codex-fast-mode", data: { enabled: false } });
  nextSession.emit("session_start");
  expect(nextSession.label).toBe("fast");
  nextSession.emit("session_tree");
  expect(nextSession.label).toBe("fast");
  nextSession.request();
  expect(lastRequest().fast).toBe(true);
  await nextSession.toggle();
  expect(nextSession.status).toBeUndefined();
  expect(readSavedPreference()).toEqual({ enabled: false });

  const offSession = createFastModeRuntime();
  offSession.entries.push({ type: "custom", customType: "codex-fast-mode", data: { enabled: true } });
  offSession.emit("session_start");
  expect(offSession.status).toBeUndefined();
  offSession.request();
  expect(lastRequest().fast).toBe(false);
});

test("missing or invalid preferences fall back to validated session entries", () => {
  const harness = createFastModeRuntime();
  harness.entries.push({ type: "custom", customType: "codex-fast-mode", data: { enabled: true } });
  harness.entries.push({ type: "custom", customType: "codex-fast-mode", data: { enabled: "false" } });
  harness.emit("session_start");
  expect(harness.label).toBe("fast");

  mkdirSync(stateDirectoryPath());
  writeFileSync(stateFilePath(), "invalid json");
  harness.emit("session_start");
  expect(harness.label).toBe("fast");
  writeFileSync(stateFilePath(), JSON.stringify({ enabled: "true" }));
  harness.entries.length = 0;
  harness.emit("session_start");
  expect(harness.status).toBeUndefined();
});

test("a failed preference write leaves fast mode unchanged", async () => {
  writeFileSync(stateDirectoryPath(), "not a directory");
  const harness = createFastModeRuntime();
  harness.emit("session_start");
  await harness.toggle();
  expect(harness.status).toBeUndefined();
  expect(harness.entries).toEqual([]);
  expect(harness.notifications).toEqual(["Could not save the fast-mode preference. Fast mode was not changed."]);
  harness.request();
  expect(lastRequest().fast).toBe(false);
});
