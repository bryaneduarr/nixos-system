import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createBackendExecutor } from "../backends/call-backend-tool.test-double.ts";
import { searchRepo } from "./search-repo.service.ts";

const NO_CANCELLATION = { kind: "uncancellable" } as const;
const NO_ENGINES = createBackendExecutor({});
const workspace = await mkdtemp(join(tmpdir(), "search-repo-"));

describe("searchRepo", () => {
  beforeAll(async () => {
    await mkdir(join(workspace, "src", "auth"), { recursive: true });
    await writeFile(join(workspace, "src", "auth", "login.ts"), "export function login() {\n  useLogin(user);\n}\n");
  });

  afterAll(async () => {
    await rm(workspace, { recursive: true, force: true });
  });

  test("reports a missing path instead of no matches", async () => {
    const output = await searchRepo({
      cwd: workspace,
      query: "login",
      kind: "text",
      scope: { kind: "path", path: "missing/folder" },
      limit: 10,
      cancellation: NO_CANCELLATION,
      backend: NO_ENGINES,
    });
    expect(output).toBe("Path not found: missing/folder");
  });

  test("falls back to literal matching for an invalid regular expression", async () => {
    const output = await searchRepo({
      cwd: workspace,
      query: "useLogin(",
      kind: "text",
      scope: { kind: "workspace" },
      limit: 10,
      cancellation: NO_CANCELLATION,
      backend: NO_ENGINES,
    });
    expect(output).toContain("src/auth/login.ts:2");
  });

  test("finds files by a query that contains a folder path", async () => {
    const output = await searchRepo({
      cwd: workspace,
      query: "src/auth",
      kind: "file",
      scope: { kind: "workspace" },
      limit: 10,
      cancellation: NO_CANCELLATION,
      backend: NO_ENGINES,
    });
    expect(output).toBe("Files:\nsrc/auth/login.ts");
  });
});
