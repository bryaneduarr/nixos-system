import { StringEnum } from "@earendil-works/pi-ai";
import { Type } from "typebox";

export const EditParamsSchema = Type.Object({
  op: StringEnum(["replace", "create", "delete", "move"] as const, {
    description:
      "replace edits an existing file, create writes a new file, delete removes a file, move renames or relocates a file.",
  }),
  path: Type.Optional(Type.String({ description: "Target file. Required for replace, create, delete, move." })),
  oldText: Type.Optional(Type.String({ description: "Exact text to replace for op=replace." })),
  newText: Type.Optional(Type.String({ description: "Replacement text for op=replace." })),
  edits: Type.Optional(
    Type.Array(
      Type.Object({
        oldText: Type.String(),
        newText: Type.String(),
      }),
      { description: "Batch of exact replacements applied in order for op=replace." },
    ),
  ),
  replaceAll: Type.Optional(
    Type.Boolean({
      description: "Allow replacing every occurrence of oldText. Defaults to false.",
    }),
  ),
  content: Type.Optional(Type.String({ description: "File contents for op=create." })),
  overwrite: Type.Optional(Type.Boolean({ description: "Allow overwriting an existing file." })),
  from: Type.Optional(Type.String({ description: "Source path for op=move (alias of path)." })),
  to: Type.Optional(Type.String({ description: "Destination path for op=move." })),
});
