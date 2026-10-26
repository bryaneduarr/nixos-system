import { EMPTY_FILE_CONTENT, EMPTY_REPLACEMENT_TEXT } from "../../../../constants/tools/edit/edit-text.constant.ts";
import type { EditParameters } from "../../../../types/tools/edit/edit-parameters.interface.ts";
import type { EditRequestValidation } from "../../../../types/tools/edit/edit-request-validation.interface.ts";
import type { TextEdit } from "../../../../types/tools/edit/text-edit.interface.ts";

function replacementText(params: EditParameters): string {
  return params.newText === undefined ? EMPTY_REPLACEMENT_TEXT : params.newText;
}

function newFileContent(params: EditParameters): string {
  return params.content === undefined ? EMPTY_FILE_CONTENT : params.content;
}

function replaceEdits(params: EditParameters): readonly TextEdit[] {
  if (params.edits && params.edits.length > 0) return params.edits;
  if (params.oldText !== undefined) return [{ oldText: params.oldText, newText: replacementText(params) }];
  return [];
}

export function toEditRequest(cwd: string, params: EditParameters): EditRequestValidation {
  const path = params.path ?? params.from;
  const overwrite = params.overwrite === true;
  if (!path) {
    return { valid: false, summary: "edit failed: 'path' is required." };
  }
  if (params.op === "replace") {
    return {
      valid: true,
      request: {
        cwd,
        change: { op: "replace", path, edits: replaceEdits(params), replaceAll: params.replaceAll === true },
      },
    };
  }
  if (params.op === "create") {
    return {
      valid: true,
      request: { cwd, change: { op: "create", path, content: newFileContent(params), overwrite } },
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
    request: { cwd, change: { op: "move", path, destination: params.to, overwrite } },
  };
}
