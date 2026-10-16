import { afterAll, afterEach, beforeEach } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CODEX_MODELS_CACHE = {
  models: [{ slug: "test-fast-model", service_tiers: [{ id: "priority" }] }],
};

let homeDirectory = "";

export function stateDirectoryPath(): string {
  return join(homeDirectory, "pi");
}

export function stateFilePath(): string {
  return join(stateDirectoryPath(), "codex-fast-mode.json");
}

export function readSavedPreference(): unknown {
  return JSON.parse(readFileSync(stateFilePath(), "utf8"));
}

export function useFastModeHome(): void {
  const previousCodexHome = process.env.CODEX_HOME;
  const previousStateHome = process.env.XDG_STATE_HOME;

  beforeEach(() => {
    homeDirectory = mkdtempSync(join(tmpdir(), "pi-fast-mode-"));
    process.env.CODEX_HOME = homeDirectory;
    process.env.XDG_STATE_HOME = homeDirectory;
    writeFileSync(join(homeDirectory, "models_cache.json"), JSON.stringify(CODEX_MODELS_CACHE));
  });

  afterEach(() => rmSync(homeDirectory, { recursive: true, force: true }));

  afterAll(() => {
    if (previousCodexHome === undefined) delete process.env.CODEX_HOME;
    else process.env.CODEX_HOME = previousCodexHome;
    if (previousStateHome === undefined) delete process.env.XDG_STATE_HOME;
    else process.env.XDG_STATE_HOME = previousStateHome;
  });
}
