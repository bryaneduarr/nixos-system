import { expect, test } from "bun:test";
import type { SearchKind } from "../../../types/tools/search/search-kind.interface.ts";
import type { SearchRequest } from "../../../types/tools/search/search-request.interface.ts";
import { createBackendExecutor, type RecordedBackendCall } from "../backends/call-backend-tool.test-double.ts";
import { backendSearch } from "./backend-search.service.ts";

function requestFor(kind: SearchKind, answers: Readonly<Record<string, string>>, calls: RecordedBackendCall[]) {
  return {
    cwd: "/tmp",
    query: "login",
    kind,
    scope: { kind: "path", path: "src" },
    limit: 5,
    cancellation: { kind: "uncancellable" },
    backend: createBackendExecutor(answers, calls),
  } satisfies SearchRequest;
}

test("file search uses fff with the scope and limit", async () => {
  const calls: RecordedBackendCall[] = [];
  const result = await backendSearch(requestFor("file", { find: "src/login.ts" }, calls));
  expect(result).toEqual({ found: true, label: "file (fff)", text: "src/login.ts" });
  expect(calls).toEqual([{ toolName: "find", toolArguments: { pattern: "login", limit: 5, path: "src" } }]);
});

test("symbol search prefers the language server and falls back to tree-sitter", async () => {
  const withServer = await backendSearch(
    requestFor("symbol", { lsp_workspace_symbols: "login src/login.ts:1", find_definition: "unused" }, []),
  );
  expect(withServer).toEqual({ found: true, label: "symbol (language server)", text: "login src/login.ts:1" });

  const withoutServer = await backendSearch(requestFor("symbol", { find_definition: "src/login.ts:1" }, []));
  expect(withoutServer).toEqual({ found: true, label: "symbol (tree-sitter)", text: "src/login.ts:1" });
});

test("reports no answer when no engine is available", async () => {
  expect(await backendSearch(requestFor("references", {}, []))).toEqual({ found: false });
  expect(await backendSearch(requestFor("text", { find: "unused" }, []))).toEqual({ found: false });
});
