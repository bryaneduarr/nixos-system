import { Value } from "typebox/value";
import { EDIT_OPERATIONS } from "../../../../constants/tools/edit/edit-operations.constant.ts";
import { RawEditArgumentsSchema } from "../../../../schemas/tools/edit/raw-edit-arguments.schema.ts";
import type { EditOperation } from "../../../../types/tools/edit/edit-operation.interface.ts";
import type { EditParameters } from "../../../../types/tools/edit/edit-parameters.interface.ts";

const OPERATION_WORD_PATTERN = new RegExp(`\\b(${EDIT_OPERATIONS.join("|")})\\b`);

function isEditOperation(text: string): text is EditOperation {
  return EDIT_OPERATIONS.some((operation) => operation === text);
}

function namedOperation(rawOperation: string): EditOperation | "unknown" {
  const match = OPERATION_WORD_PATTERN.exec(rawOperation);
  if (!match) return "unknown";
  const [, word] = match;
  return word !== undefined && isEditOperation(word) ? word : "unknown";
}

function inferredOperation(rawArguments: Omit<EditParameters, "op">): EditOperation | "unknown" {
  if (rawArguments.to !== undefined) return "move";
  if (rawArguments.edits !== undefined || rawArguments.oldText !== undefined) return "replace";
  if (rawArguments.content !== undefined) return "create";
  return "unknown";
}

export function prepareEditArguments(rawArguments: unknown): EditParameters {
  if (!Value.Check(RawEditArgumentsSchema, rawArguments)) {
    throw new Error("edit expects { op, path, ... } with string fields; see the tool schema.");
  }
  const { op: rawOperation, ...fields } = rawArguments;
  if (rawOperation !== undefined && isEditOperation(rawOperation)) return { ...fields, op: rawOperation };

  const named = rawOperation === undefined ? "unknown" : namedOperation(rawOperation);
  const operation = named === "unknown" ? inferredOperation(fields) : named;
  if (operation === "unknown") {
    throw new Error("edit requires 'op': one of replace, create, delete, move.");
  }

  return { ...fields, op: operation };
}
