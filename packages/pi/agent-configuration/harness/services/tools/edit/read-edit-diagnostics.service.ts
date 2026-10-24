import { LSP_DIAGNOSTICS_TOOL } from "../../../constants/tools/backends/backend-tools.constant.ts";
import { DIAGNOSTIC_FILE_PATTERN } from "../../../constants/tools/edit/diagnostic-file.constant.ts";
import type { BackendToolExecutor } from "../../../types/tools/backends/backend-tool-executor.interface.ts";
import type { EditRequest } from "../../../types/tools/edit/edit-request.interface.ts";
import { callBackendTool } from "../backends/call-backend-tool.service.ts";
import { resolveToolPath } from "../path/resolve-tool-path.service.ts";

export async function readEditDiagnostics(executor: BackendToolExecutor, request: EditRequest): Promise<string> {
  const { change } = request;
  if (change.op === "delete") return "";

  const file = change.op === "move" ? change.destination : change.path;
  if (!DIAGNOSTIC_FILE_PATTERN.test(file)) return "";

  const diagnostics = await callBackendTool(executor, LSP_DIAGNOSTICS_TOOL, {
    filePath: resolveToolPath(request.cwd, file),
  });
  return diagnostics.found ? `\n\n${diagnostics.text}` : "";
}
