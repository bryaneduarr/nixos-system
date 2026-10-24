import { expect, test } from "bun:test";
import { callBackendTool } from "./call-backend-tool.service.ts";
import { createBackendExecutor } from "./call-backend-tool.test-double.ts";

test("returns the text of a backend answer", async () => {
  const executor = createBackendExecutor({ find: "src/login.ts" });
  expect(await callBackendTool(executor, "find", {})).toEqual({ found: true, text: "src/login.ts" });
});

test("treats missing tools, empty searches, and engine failures as no answer", async () => {
  const executor = createBackendExecutor({
    lsp_workspace_symbols: "No LSP workspace symbols found.",
    find_callers: "No callers found for 'login'",
    lsp_diagnostics: "lsp_diagnostics failed: vtsls is not installed.",
  });
  expect(await callBackendTool(executor, "missing_tool", {})).toEqual({ found: false });
  expect(await callBackendTool(executor, "lsp_workspace_symbols", {})).toEqual({ found: false });
  expect(await callBackendTool(executor, "find_callers", {})).toEqual({ found: false });
  expect(await callBackendTool(executor, "lsp_diagnostics", {})).toEqual({ found: false });
});

test("keeps a clean diagnostics report as an answer", async () => {
  const executor = createBackendExecutor({ lsp_diagnostics: "No LSP diagnostics for /tmp/a.ts." });
  expect(await callBackendTool(executor, "lsp_diagnostics", {})).toEqual({
    found: true,
    text: "No LSP diagnostics for /tmp/a.ts.",
  });
});
