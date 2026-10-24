import { DIAGNOSTIC_FILE_PATTERN, LSP_DIAGNOSTICS_TOOL } from "../../../constants/tools/backend-tools.constant.ts";
import type { BackendToolExecutor } from "../../../types/tools/backends/backend-tool-executor.interface.ts";
import type { EditRequest } from "../../../types/tools/edit/edit-request.interface.ts";
import { callBackendTool } from "../backends/call-backend-tool.service.ts";
import { resolveToolPath } from "../path/resolve-tool-path.service.ts";

function editedFile(request: EditRequest): string {
  const { change } = request;
  switch (change.op) {
    case "delete":
      return "";
    case "move":
      return change.destination;
    default:
      return change.path;
  }
}

export async function readEditDiagnostics(executor: BackendToolExecutor, request: EditRequest): Promise<string> {
  const file = editedFile(request);
  if (!DIAGNOSTIC_FILE_PATTERN.test(file)) return "";

  const diagnostics = await callBackendTool(executor, LSP_DIAGNOSTICS_TOOL, {
    filePath: resolveToolPath(request.cwd, file),
  });
  return diagnostics.found ? `\n\n${diagnostics.text}` : "";
}
