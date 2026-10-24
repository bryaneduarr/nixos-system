import type { EditParameters } from "../../../../types/tools/edit/edit-parameters.interface.ts";
import type { EditRequestValidation, TextEdit } from "../../../../types/tools/edit/edit-request.interface.ts";

function replaceEdits(params: EditParameters): readonly TextEdit[] {
  if (params.edits && params.edits.length > 0) return params.edits;
  if (params.oldText !== undefined) return [{ oldText: params.oldText, newText: params.newText ?? "" }];
  return [];
}

export function toEditRequest(cwd: string, params: EditParameters): EditRequestValidation {
  const path = params.path ?? params.from;
  if (!path) {
    return { valid: false, summary: "edit failed: 'path' is required." };
  }
  if (params.op === "replace") {
    return {
      valid: true,
      request: {
        cwd,
        change: { op: "replace", path, edits: replaceEdits(params), replaceAll: params.replaceAll ?? false },
      },
    };
  }
  if (params.op === "create") {
    return {
      valid: true,
      request: {
        cwd,
        change: { op: "create", path, content: params.content ?? "", overwrite: params.overwrite ?? false },
      },
    };
  }
  if (params.op === "delete") {
    return { valid: true, request: { cwd, change: { op: "delete", path } } };
  }
  if (!params.to) {
    return { valid: false, summary: "Move failed: 'to' is required." };
  }
  return {
    valid: true,
    request: { cwd, change: { op: "move", path, destination: params.to, overwrite: params.overwrite ?? false } },
  };
}
