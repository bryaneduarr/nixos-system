import { StringEnum } from "@earendil-works/pi-ai";
import { Type } from "typebox";
import { EDIT_OPERATIONS } from "../../../constants/tools/edit/edit-operations.constant.ts";

export const EditParamsSchema = Type.Object({
  /** Operation the model asks for. */
  op: StringEnum(EDIT_OPERATIONS, {
    description:
      "replace edits an existing file, create writes a new file, delete removes a file, move renames or relocates a file.",
  }),
  /** Target file for every operation. */
  path: Type.Optional(Type.String({ description: "Target file. Required for replace, create, delete, move." })),
  /** Single exact text to replace for op=replace. */
  oldText: Type.Optional(Type.String({ description: "Exact text to replace for op=replace." })),
  /** Replacement for oldText. */
  newText: Type.Optional(Type.String({ description: "Replacement text for op=replace." })),
  /** Batch of exact replacements applied in order for op=replace. */
  edits: Type.Optional(
    Type.Array(
      Type.Object({
        /** Exact text to find. */
        oldText: Type.String(),
        /** Text that replaces it. */
        newText: Type.String(),
      }),
      { description: "Batch of exact replacements applied in order for op=replace." },
    ),
  ),
  /** Whether every occurrence of each oldText is replaced. */
  replaceAll: Type.Optional(
    Type.Boolean({
      description: "Allow replacing every occurrence of oldText. Defaults to false.",
    }),
  ),
  /** Contents of a new file for op=create. */
  content: Type.Optional(Type.String({ description: "File contents for op=create." })),
  /** Whether an existing file may be replaced. */
  overwrite: Type.Optional(Type.Boolean({ description: "Allow overwriting an existing file." })),
  /** Source path for op=move. */
  from: Type.Optional(Type.String({ description: "Source path for op=move (alias of path)." })),
  /** Destination path for op=move. */
  to: Type.Optional(Type.String({ description: "Destination path for op=move." })),
});
