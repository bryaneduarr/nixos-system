import type { BackendToolExecutor } from "../../../types/tools/backends/backend-tool-executor.interface.ts";
import type { EditParameters } from "../../../types/tools/edit/edit-parameters.interface.ts";
import { editFile } from "./change/edit-file.service.ts";
import { readEditDiagnostics } from "./read-edit-diagnostics.service.ts";
import { toEditRequest } from "./request/to-edit-request.service.ts";

export async function executeEdit(backend: BackendToolExecutor, cwd: string, params: EditParameters): Promise<string> {
  const validation = toEditRequest(cwd, params);
  if (!validation.valid) return validation.summary;

  const result = await editFile(validation.request);
  const diagnostics = result.changed ? await readEditDiagnostics(backend, validation.request) : "";
  return `${result.summary}${diagnostics}`;
}
